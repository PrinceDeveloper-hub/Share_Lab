import { Badge } from './Badge'
import type { BadgeTone } from './Badge'
import type { Booking } from '../../lib/booking-service'
import { cn } from '../../lib/utils'

export const bookingStatusLabels: Record<Booking['status'], string> = {
  pending: 'Pending review',
  waitlisted: 'Waitlisted',
  approved: 'Approved',
  rejected: 'Rejected',
  checked_in: 'Checked in',
  returned: 'Returned',
  cancelled: 'Cancelled',
}

const bookingStatusTones: Record<Booking['status'], BadgeTone> = {
  pending: 'warning',
  waitlisted: 'bronze',
  approved: 'success',
  rejected: 'error',
  checked_in: 'espresso',
  returned: 'neutral',
  cancelled: 'neutral',
}

export interface StatusBadgeProps {
  status: Booking['status']
  dot?: boolean
  className?: string
}

export const StatusBadge = ({
  status,
  dot = true,
  className,
}: StatusBadgeProps) => (
  <Badge tone={bookingStatusTones[status]} dot={dot} className={cn(className)}>
    {bookingStatusLabels[status]}
  </Badge>
)

export default StatusBadge
