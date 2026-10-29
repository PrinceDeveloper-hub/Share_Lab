import { GlassPanel } from '../../components/glass/GlassPanel'
import { cn } from '../../lib/utils'
import { useBookings } from '../../hooks/useBookings'
import { useState } from 'react'

export const CheckInReturn = ({
  bookingId,
  type,
}: {
  bookingId: string
  type: 'check-in' | 'return'
}) => {
  const { bookings } = useBookings()
  const booking = bookings?.find((b) => String(b.id) === bookingId)
  const [condition, setCondition] = useState<
    'excellent' | 'good' | 'fair' | 'damaged'
  >('good')
  const [notes, setNotes] = useState<string>('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [open, setOpen] = useState(false)

  // Determine if this is check-in or return
  const isCheckIn = type === 'check-in'
  const submitLabel = isCheckIn ? 'Check In' : 'Return Items'

  return (
    <GlassPanel className="p-6 md:p-12 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-charcoal mb-6">
        {isCheckIn ? 'Check In' : 'Return Items'}
      </h2>

      <form
        className="space-y-4"
        onSubmit={async (e: React.FormEvent) => {
          e.preventDefault()
          setOpen(true)
        }}
      >
        {/* Booking summary */}
        {booking && (
          <GlassPanel className="p-4 mb-6 rounded-lg bg-[var(--soft-beige)]">
            <p className="text-[var(--muted)] text-sm mb-2">
              Booking: {booking.resource_id} - {booking.start_at} to{' '}
              {booking.end_at}
            </p>
            <p className="font-medium text-espresso">
              {booking.purpose || 'No purpose specified'}
            </p>
          </GlassPanel>
        )}

        {/* Condition selection */}
        <GlassPanel>
          <p className="text-[var(--muted)] text-sm mb-3">Condition</p>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setCondition('excellent')}
              className={cn(
                'rounded-lg p-2 text-center',
                condition === 'excellent'
                  ? 'bg-[var(--success)] text-white'
                  : 'bg-soft-beige text-espresso',
                'hover:bg-[var(--taupe)] hover:text-white transition-colors',
              )}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3 9h2l3-9h-2l-3-9h-2l3 9H12z" />
              </svg>
            </button>
            <button
              onClick={() => setCondition('good')}
              className={cn(
                'rounded-lg p-2 text-center',
                condition === 'good'
                  ? 'bg-[var(--success)] text-white'
                  : 'bg-soft-beige text-espresso',
                'hover:bg-[var(--taupe)] hover:text-white transition-colors',
              )}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 4l-7 8 7 8" />
              </svg>
            </button>
            <button
              onClick={() => setCondition('fair')}
              className={cn(
                'rounded-lg p-2 text-center',
                condition === 'fair'
                  ? 'bg-[var(--success)] text-white'
                  : 'bg-soft-beige text-espresso',
                'hover:bg-[var(--taupe)] hover:text-white transition-colors',
              )}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 8a6 6 0 1 1 6 6A6.013 6.013 0 0 1 12 10z" />
              </svg>
            </button>
            <button
              onClick={() => setCondition('damaged')}
              className={cn(
                'rounded-lg p-2 text-center',
                condition === 'damaged'
                  ? 'bg-[var(--error)] text-white'
                  : 'bg-soft-beige text-espresso',
                'hover:bg-[var(--taupe)] hover:text-white transition-colors',
              )}
            >
              <svg
                className="w-5 h-5 text-[var(--error)]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.5 14.5l-7-7a3.5 3.5 0 0 0-5 5L3.5 19.5" />
              </svg>
            </button>
          </div>
        </GlassPanel>

        {/* Notes */}
        <div>
          <label className="block text-[var(--muted)] text-sm mb-2">
            Notes
          </label>
          <textarea
            rows={3}
            className="w-full bg-soft-beige dark:bg-[var(--deep-brown)] border border-sand rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-espresso resize-none text-sm"
            placeholder="Enter any notes about the condition..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        {/* Photo upload (check-in only) */}
        {!isCheckIn || photo ? (
          <div>
            <label className="block text-[var(--muted)] text-sm mb-2">
              Photo (check-in)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="w-full bg-soft-beige dark:bg-[var(--deep-brown)] border border-sand rounded-md px-3 py-2 cursor-pointer font-medium text-sm"
            />
          </div>
        ) : (
          <div>
            <p className="text-[var(--muted)] text-sm">
              Photo upload available for check-in only.
            </p>
          </div>
        )}

        {/* Submit */}
        <GlassPanel>
          <button
            type="submit"
            className="w-full bg-espresso text-white px-6 py-3 rounded-full font-medium hover:bg-[var(--deep-brown)] transition-colors"
          >
            {submitLabel}
          </button>
        </GlassPanel>
      </form>

      {/* Confirmation modal */}
      {open && (
        <GlassPanel className="p-8 text-center fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-cream dark:bg-darkBrown rounded-2xl p-8 max-w-sm">
            <h3 className="text-2xl font-bold text-charcoal mb-4">
              {isCheckIn ? 'Check-in successful!' : 'Items returned!'}
            </h3>
            <p className="text-[var(--muted)] text-sm mb-6">
              Your {isCheckIn ? 'check-in' : 'return'} has been recorded.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="bg-espresso text-white px-6 py-3 rounded-full font-medium hover:bg-[var(--deep-brown)] transition-colors"
            >
              OK
            </button>
          </div>
        </GlassPanel>
      )}
    </GlassPanel>
  )
}

export default CheckInReturn
