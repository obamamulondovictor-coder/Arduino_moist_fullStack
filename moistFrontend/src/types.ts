export type IrrigationMode = 'AUTO' | 'MANUAL'
export type PumpStatus = 'ON' | 'OFF' | 'UNKNOWN'
export type AlertSeverity = 'critical' | 'warning' | 'info'
export type ControlFault = 'MAX_RUNTIME' | null

export type AlertCode =
  | 'DEVICE_OFFLINE'
  | 'SENSOR_FAULT'
  | 'STALE_READING'
  | 'LOW_TANK'
  | 'DRY_SOIL'
  | 'IRRIGATING'
  | 'COOLDOWN'
  | 'MAX_RUNTIME'

export interface Alert {
  id: string
  code: AlertCode
  severity: AlertSeverity
  title: string
  message: string
  timestamp: number
}

export type ActivityTone = 'success' | 'warning' | 'danger' | 'neutral'

export interface ActivityEvent {
  id: string
  type: 'pump' | 'mode' | 'settings' | 'system' | 'command'
  title: string
  detail: string
  timestamp: number
  tone: ActivityTone
}

export interface DeviceSummary {
  deviceId: string
  deviceName: string
  firmwareVersion: string
  status: string
  online: boolean
  lastSeen: number | null
  createdAt: number
  pumpStatus: PumpStatus
  mode: IrrigationMode
  soilMoisture: number | null
  tankLevel: number | null
  lastReadingAt: number | null
}

export interface Telemetry {
  deviceId: string
  soilMoisture: number | null
  airTemperature: number | null
  airHumidity: number | null
  tankLevel: number | null
  sensorValid: boolean
  signalStrength: number
  timestamp: number
}

export interface HistoryPoint {
  timestamp: number
  moisture: number | null
  tank: number | null
  pumpOn: boolean
}

export interface IrrigationSettings {
  startThreshold: number
  stopThreshold: number
  maxRuntimeSeconds: number
  cooldownSeconds: number
  minTankLevel: number
  staleAfterSeconds: number
}

export interface DeviceSnapshot {
  telemetry: Telemetry
  pumpStatus: PumpStatus
  mode: IrrigationMode
  online: boolean
  pumpStartedAt: number | null
  cooldownUntil: number | null
  fault: ControlFault
  faultAt: number | null
  settings: IrrigationSettings
  alerts: Alert[]
  events: ActivityEvent[]
  history: HistoryPoint[]
  lastSync: number | null
  controlReason: string
  firmware: string
  deviceName: string
}
