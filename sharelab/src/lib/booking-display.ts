import {
  CheckCircle2,
  Clock3,
  KeyRound,
  ListOrdered,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import type { Booking } from './booking-service'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
})

export const formatBookingWindow = (
  booking: Pick<Booking, 'start_at' | 'end_at'>,
) => {
  const start = new Date(booking.start_at)
  const end = new Date(booking.end_at)
  const sameDay = start.toDateString() === end.toDateString()

  if (sameDay) {
    return `${dateFormatter.format(start)} · ${timeFormatter.format(start)}–${timeFormatter.format(end)}`
  }

  return `${dateFormatter.format(start)} – ${dateFormatter.format(end)}`
}

export const formatBookingDate = (value: string) => {
  const date = new Date(value)
  return `${dateFormatter.format(date)} · ${timeFormatter.format(date)}`
}

export const bookingStatusDetails = {
  pending: {
    label: 'Pending',
    icon: Clock3,
    tone: 'bg-[rgba(154,107,34,0.12)] text-(--warning)',
  },
  waitlisted: {
    label: 'Waitlisted',
    icon: ListOrdered,
    tone: 'bg-[rgba(154,107,34,0.12)] text-(--warning)',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    tone: 'bg-[rgba(53,107,76,0.12)] text-(--success)',
  },
  checked_in: {
    label: 'Checked in',
    icon: KeyRound,
    tone: 'bg-[rgba(53,107,76,0.12)] text-(--success)',
  },
  returned: {
    label: 'Returned',
    icon: RotateCcw,
    tone: 'bg-[rgba(81,53,34,0.07)] text-(--muted)',
  },
  rejected: {
    label: 'Declined',
    icon: XCircle,
    tone: 'bg-[rgba(169,72,60,0.1)] text-(--error)',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    tone: 'bg-[rgba(169,72,60,0.1)] text-(--error)',
  },
} satisfies Record<
  Booking['status'],
  {
    label: string
    icon: typeof Clock3
    tone: string
  }
>

export const openBookingStatuses: Booking['status'][] = [
  'pending',
  'waitlisted',
  'approved',
  'checked_in',
]

export const historyBookingStatuses: Booking['status'][] = [
  'returned',
  'rejected',
  'cancelled',
]
