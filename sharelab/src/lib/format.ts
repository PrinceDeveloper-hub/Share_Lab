const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const longDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
})

const parse = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatDate = (value: string) => {
  const date = parse(value)
  return date ? dateFormatter.format(date) : '—'
}

export const formatLongDate = (value: string) => {
  const date = parse(value)
  return date ? longDateFormatter.format(date) : '—'
}

export const formatTime = (value: string) => {
  const date = parse(value)
  return date ? timeFormatter.format(date) : '—'
}

export const formatDateTime = (value: string) => {
  const date = parse(value)
  return date
    ? `${dateFormatter.format(date)} · ${timeFormatter.format(date)}`
    : '—'
}

export const formatRange = (startAt: string, endAt: string) => {
  const start = parse(startAt)
  const end = parse(endAt)

  if (!start || !end) return '—'

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()

  if (sameDay) {
    return `${dateFormatter.format(start)} · ${timeFormatter.format(start)}–${timeFormatter.format(end)}`
  }

  return `${dateFormatter.format(start)} ${timeFormatter.format(start)} – ${dateFormatter.format(end)} ${timeFormatter.format(end)}`
}

export const formatDuration = (startAt: string, endAt: string) => {
  const start = parse(startAt)
  const end = parse(endAt)

  if (!start || !end) return '—'

  const hours = (end.getTime() - start.getTime()) / 3_600_000
  if (!Number.isFinite(hours) || hours <= 0) return '—'

  const whole = Math.floor(hours)
  const minutes = Math.round((hours - whole) * 60)

  if (minutes === 0) return `${whole}h`
  if (whole === 0) return `${minutes}m`
  return `${whole}h ${minutes}m`
}

export const isPast = (value: string) => {
  const date = parse(value)
  return date ? date.getTime() < Date.now() : false
}

export const isUpcoming = (value: string) => {
  const date = parse(value)
  return date ? date.getTime() >= Date.now() : false
}

export const toDateTimeLocalValue = (iso: string) => {
  const date = parse(iso)
  if (!date) return ''

  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}
