import type { CSSProperties } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  CloudSun,
  Droplets,
  Power,
  Thermometer,
  Waves,
  Wind,
} from 'lucide-react'
import type { DeviceSnapshot } from '../types.ts'
import {
  clamp,
  formatDuration,
  formatPercent,
  formatRelativeTime,
  formatRuntime,
  formatTemperature,
} from '../lib/format.ts'
import '../styles/metric-cards.css'

interface MetricCardsProps {
  snapshot: DeviceSnapshot
  now: number
}

function getMoistureStatus(value: number | null, start: number, stop: number) {
  if (value === null) return { label: 'No data', tone: 'danger', color: '#d14b3f' }
  if (value < start) return { label: 'Dry soil', tone: 'warning', color: '#dc8f2b' }
  if (value < stop) return { label: 'Below target', tone: 'warning', color: '#dc8f2b' }
  if (value <= 70) return { label: 'Optimal', tone: 'success', color: '#2f8b57' }
  return { label: 'Very wet', tone: 'info', color: '#3f7fad' }
}

function getTankStatus(value: number | null, minimum: number) {
  if (value === null) return { label: 'No data', tone: 'danger' }
  if (value < minimum) return { label: 'Critical', tone: 'danger' }
  if (value < 30) return { label: 'Low', tone: 'warning' }
  if (value < 70) return { label: 'Stable', tone: 'info' }
  return { label: 'Good', tone: 'success' }
}

function moistureDelta(snapshot: DeviceSnapshot): number | null {
  const readings = snapshot.history
    .filter((point) => point.moisture !== null)
    .slice(-2)

  if (readings.length < 2) return null

  const latest = readings[1].moisture
  const previous = readings[0].moisture
  if (latest === null || previous === null) return null
  return latest - previous
}

export function MetricCards({ snapshot, now }: MetricCardsProps) {
  const { telemetry, settings } = snapshot
  const hasReading =
    telemetry.soilMoisture !== null ||
    telemetry.tankLevel !== null ||
    telemetry.airTemperature !== null
  const staleSuffix = snapshot.online ? '' : ' (stale)'
  const moisture = telemetry.soilMoisture
  const tank = telemetry.tankLevel
  const moistureStatus = getMoistureStatus(
    moisture,
    settings.startThreshold,
    settings.stopThreshold,
  )
  const tankStatus = getTankStatus(tank, settings.minTankLevel)
  const pumpKnown = snapshot.pumpStatus !== 'UNKNOWN'
  const delta = moistureDelta(snapshot)
  const readingAge = hasReading
    ? formatRelativeTime(telemetry.timestamp, now)
    : 'Awaiting first reading'
  const moistureAngle = `${clamp(moisture ?? 0, 0, 100) * 3.6}deg`
  const runtime = getRuntimeSeconds(snapshot, now)
  const runtimeProgress = clamp(
    (runtime / settings.maxRuntimeSeconds) * 100,
    0,
    100,
  )

  return (
    <section className="metric-grid" id="overview" aria-label="Live field readings">
      <article className="panel metric-card">
        <header className="metric-head">
          <span className="metric-icon is-green">
            <Droplets size={19} />
          </span>
          <span className="metric-label">Soil moisture</span>
          <span className={`status-chip is-${moistureStatus.tone}`}>
            {moistureStatus.label}
            {staleSuffix}
          </span>
        </header>

        <div className="metric-body moisture-body">
          <div
            className="moisture-gauge"
            style={
              {
                '--gauge-angle': moistureAngle,
                '--gauge-color': moistureStatus.color,
              } as CSSProperties
            }
            aria-hidden="true"
          >
            <div className="gauge-inner">
              <strong>{moisture === null ? '--' : Math.round(moisture)}</strong>
              <span>%</span>
            </div>
          </div>

          <div className="metric-copy">
            <div className="metric-value">
              {formatPercent(moisture)}
              {delta !== null ? (
                <span className={`mini-trend${delta >= 0 ? ' is-up' : ' is-down'}`}>
                  {delta >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {Math.abs(delta).toFixed(1)}%
                </span>
              ) : null}
            </div>
            <p>
              {moisture === null
                ? 'Sensor fault — irrigation is locked out.'
                : !snapshot.online
                  ? 'Last database reading; the field device is offline.'
                  : moisture < settings.startThreshold

                  ? 'Below the automatic start threshold.'
                  : moisture < settings.stopThreshold
                    ? 'Recovering toward the target range.'
                    : 'Soil is inside the target moisture range.'}
            </p>
          </div>
        </div>

        <footer className="metric-foot">
          <span>
            {hasReading ? `Updated ${readingAge}` : 'Awaiting first reading'}
          </span>
          <span>Target {formatPercent(settings.stopThreshold)}</span>
        </footer>
      </article>

      <article className="panel metric-card">
        <header className="metric-head">
          <span className="metric-icon is-blue">
            <Waves size={19} />
          </span>
          <span className="metric-label">Water tank</span>
          <span className={`status-chip is-${tankStatus.tone}`}>
            {tankStatus.label}
            {staleSuffix}
          </span>
        </header>

        <div className="metric-body tank-body">
          <div className="tank-visual" aria-hidden="true">
            <div
              className={`tank-fill${tankStatus.tone === 'danger' ? ' is-critical' : ''}`}
              style={{ height: `${clamp(tank ?? 0, 0, 100)}%` }}
            />
            <span className="tank-cap" />
          </div>
          <div className="metric-copy">
            <div className="metric-value">{formatPercent(tank)}</div>
            <p>
              {tank === null
                ? 'Tank sensor is not reporting.'
                : !snapshot.online
                  ? 'Last database tank level; the field device is offline.'
                  : tank < settings.minTankLevel

                  ? `Below the ${formatPercent(settings.minTankLevel)} pump lockout.`
                  : 'Enough water is available for the next cycle.'}
            </p>
            <div className="tank-capacity">
              <span>Capacity</span>
              <strong>1,200 L</strong>
            </div>
          </div>
        </div>

        <footer className="metric-foot">
          <span>Lockout {formatPercent(settings.minTankLevel)}</span>
          <span>{tank !== null ? `${Math.round((tank / 100) * 1200)} L est.` : 'No estimate'}</span>
        </footer>
      </article>

      <article className="panel metric-card">
        <header className="metric-head">
          <span className="metric-icon is-amber">
            <Power size={19} />
          </span>
          <span className="metric-label">Irrigation pump</span>
          <span
            className={`status-chip ${
              !pumpKnown
                ? 'is-neutral'
                : snapshot.pumpStatus === 'ON'
                  ? 'is-success'
                  : 'is-neutral'
            }`}
          >
            {!pumpKnown
              ? 'Unknown'
              : snapshot.pumpStatus === 'ON'
                ? 'Running'
                : 'Standby'}
          </span>
        </header>

        <div className="metric-body pump-body">
          <div
            className={`pump-orb${
              snapshot.pumpStatus === 'ON' ? ' is-running' : ''
            }`}
          >
            <Power size={28} />
          </div>
          <div className="metric-copy">
            <div className="metric-value">
              {!pumpKnown
                ? '--'
                : snapshot.pumpStatus === 'ON'
                  ? 'ON'
                  : 'OFF'}
              <span className="metric-subvalue">
                {pumpKnown
                  ? snapshot.mode === 'AUTO'
                    ? 'Auto'
                    : 'Manual'
                  : 'Offline'}
              </span>
            </div>
            <p>{snapshot.controlReason}</p>
            <div className="runtime-track" aria-hidden="true">
              <span style={{ width: `${runtimeProgress}%` }} />
            </div>
          </div>
        </div>

        <footer className="metric-foot">
          <span>
            {!pumpKnown
              ? 'Pump state unknown'
              : snapshot.pumpStatus === 'ON'
              ? `Runtime ${formatRuntime(snapshot.pumpStartedAt, now)}`
              : 'Pump is ready'}
          </span>
          <span>Limit {formatDuration(settings.maxRuntimeSeconds)}</span>
        </footer>
      </article>

      <article className="panel metric-card">
        <header className="metric-head">
          <span className="metric-icon is-sky">
            <CloudSun size={19} />
          </span>
          <span className="metric-label">Field climate</span>
          <span className="status-chip is-info">DHT22</span>
        </header>

        <div className="climate-body">
          <div className="climate-reading">
            <span className="climate-icon is-warm">
              <Thermometer size={18} />
            </span>
            <div>
              <strong>
                {formatTemperature(telemetry.airTemperature)}
              </strong>
              <span>Air temperature</span>
            </div>
          </div>
          <div className="climate-reading">
            <span className="climate-icon is-cool">
              <Wind size={18} />
            </span>
            <div>
              <strong>
                {telemetry.airHumidity === null
                  ? '--'
                  : `${telemetry.airHumidity}%`}
              </strong>
              <span>Relative humidity</span>
            </div>
          </div>
          <div className="signal-row">
            <span>Wi-Fi signal</span>
            <div
              className="signal-bars"
              aria-label={
                hasReading
                  ? `${telemetry.signalStrength}% signal`
                  : 'Signal unknown'
              }
            >
              {[1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  className={
                    hasReading && telemetry.signalStrength >= bar * 20
                      ? 'is-filled'
                      : ''
                  }
                />
              ))}
            </div>
            <strong>{hasReading ? `${telemetry.signalStrength}%` : '--'}</strong>
          </div>
        </div>

        <footer className="metric-foot">
          <span>
            {hasReading ? `Last reading ${readingAge}` : 'Awaiting first reading'}
          </span>
          <span>North field</span>
        </footer>
      </article>
    </section>
  )
}

function getRuntimeSeconds(snapshot: DeviceSnapshot, now: number): number {
  if (snapshot.pumpStartedAt === null) return 0
  return Math.max(0, (now - snapshot.pumpStartedAt) / 1000)
}
