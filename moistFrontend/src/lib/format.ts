export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function formatPercent(value: number | null, digits = 0): string {
  if (value === null || Number.isNaN(value)) return '--'
  return `${value.toFixed(digits)}%`
}

export function formatTemperature(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '--'
  return `${value.toFixed(1)}°C`
}

export function formatRelativeTime(
  timestamp: number | null,
  now = Date.now(),
): string {
  if (timestamp === null || Number.isNaN(timestamp)) return 'Awaiting first reading'
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000))

  if (seconds < 5) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60

  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}

export function formatRuntime(startedAt: number | null, now = Date.now()): string {
  if (startedAt === null) return '0s'
  return formatDuration((now - startedAt) / 1000)
}
