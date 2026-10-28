import { GlassPanel } from '../../components/glass/GlassPanel'
import { cn } from '../../lib/utils'
import { useBookings } from '../../hooks/useBookings'
import { useState } from 'react'

export const MyBookings = () => {
  const { bookings } = useBookings()
  const [view, setView] = useState<'active' | 'history' | 'all'>('all')

  const filteredBookings = bookings?.filter((booking) => {
    if (view === 'active') {
      return ['approved', 'checked_in', 'waitlisted'].includes(booking.status)
    }
    if (view === 'history') {
      return ['returned', 'cancelled', 'rejected'].includes(booking.status)
    }
    return true
  })

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    waitlisted: 'Waitlisted',
    checked_in: 'Checked In',
    returned: 'Returned',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  }

  return (
    <GlassPanel className="p-6 md:p-12 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-charcoal mb-4">My Bookings</h1>

      {/* Tab navigation */}
      <div className="grid grid-cols-3 mb-6">
        <button
          onClick={() => setView('all')}
          className={cn(
            'flex-1 rounded-md border px-3 py-2 text-sm font-medium ',
            view === 'all' ? 'bg-espresso text-white' : 'bg-softBeige text-espresso hover:bg-[--taupe] hover:text-white transition-colors'
          )}
        >
          All ({bookings?.length || 0})
        </button>
        <button
          onClick={() => setView('active')}
          className={cn(
            'flex-1 rounded-md border px-3 py-2 text-sm font-medium ',
            view === 'active' ? 'bg-espresso text-white' : 'bg-softBeige text-espresso hover:bg-[--taupe] hover:text-white transition-colors'
          )}
        >
          Active ({filteredBookings?.filter((b) => ['approved', 'checked_in', 'waitlisted'].includes(b.status)).length || 0})
        </button>
        <button
          onClick={() => setView('history')}
          className={cn(
            'flex-1 rounded-md border px-3 py-2 text-sm font-medium ',
            view === 'history' ? 'bg-espresso text-white' : 'bg-softBeige text-espresso hover:bg-[--taupe] hover:text-white transition-colors'
          )}
        >
          History
        </button>
      </div>

      {/* Bookings list */}
      <GlassPanel>
        {bookings?.length === 0 && (
          <p className="p-6 text-center text-[--muted]">
            No bookings found.
          </p>
        )}

        {filteredBookings?.map((booking) => (
          <GlassPanel
            key={booking.id}
            className="p-4 rounded-[12px] mb-3 border-t border-sand"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-charcoal mb-1">
                  {booking.resource_id}
                </h3>
                <p className="text-[--muted] text-sm">
                  {booking.start_at} - {booking.end_at}
                </p>
              </div>
              <span
                className={cn(
                  'px-2 py-1 rounded text-xs',
                  statusLabels[booking.status as keyof typeof statusLabels]
                    ? `bg-[${statusLabels[booking.status as keyof typeof statusLabels]
                          .replace(' ', '-')
                          .toLowerCase()
                          .replace('In', 'checked-in')
                          .replace(' ', '-')
                          .toLowerCase()
                }] text-white` : 'bg-[--muted] text-[--charcoal]'
                )}
              >
                {statusLabels[booking.status as keyof typeof statusLabels]}
              </span>
            </div>

            <div className="mt-2 text-right">
              <button
                className="text-[--taupe] text-sm hover:text-espresso transition-colors mr-2"
              >
                View
              </button>
              {booking.status === 'approved' && (
                <button
                  className="text-[--warning] text-sm hover:text-amber-400 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </GlassPanel>
        ))}
      </GlassPanel>
    </GlassPanel>
  )
}
export default MyBookings