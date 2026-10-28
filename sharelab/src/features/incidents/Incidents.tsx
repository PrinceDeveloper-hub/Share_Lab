import { GlassPanel } from '../../components/glass/GlassPanel'
import { cn } from '../../lib/utils'
import { useBookings, useMutation } from '../../hooks/useBookings'
import { useState } from 'react'

export const Incidents = () => {
  const { bookings } = useBookings()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'damage' | 'delay' | 'other'>('damage')
  const [description, setDescription] = useState<string>('')
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null)

  // Create incident mutation
  const createMutation = useMutation({
    mutationKey: ['create-incident'],
    mutationFn: async (incidentData: {
      bookingId: string
      type: 'damage' | 'delay' | 'other'
      description: string
    }) => {
      // In real app, would call API
      console.log('Creating incident:', incidentData)
      return { success: true }
    },
    onSuccess: () => {
      setOpen(true)
      setDescription('')
      setType('damage')
    },
  })

  // Selected booking info panel (reusable)
  const selectedBookingPanel = selectedBooking
    ? (
        <GlassPanel className="p-4 mb-6 rounded-lg bg-[--soft-beige]">
          <p className="text-[--muted] text-sm mb-2">Reporting for booking:</p>
          <p className="font-medium text-espresso">{selectedBooking}</p>
        </GlassPanel>
      )
    : null

  // Selected booking info for the report section
  const selectedBookingInfo = selectedBooking
    ? (
        <GlassPanel className="mt-6 p-4 rounded-lg bg-[--soft-beige]">
          <p className="text-[--muted] text-sm mb-2">Booking:</p>
          <p className="font-medium text-espresso">{selectedBooking}</p>
        </GlassPanel>
      )
    : null

  // Submit button content
  const submitButton = (
    <GlassPanel>
      <button
        onClick={handleSubmit}
        className="w-full bg-espresso text-white px-6 py-3 rounded-full font-medium hover:bg-[--deep-brown] transition-colors"
        disabled={!selectedBooking || createMutation.isLoading}
      >
        {createMutation.isLoading ? 'Submitting...' : 'Report Incident'}
      </button>
    </GlassPanel>
  )

  // Handle submit action
  const handleSubmit = () => {
    if (selectedBooking) {
      createMutation.mutate({ bookingId: selectedBooking, type, description })
    }
  }

  // Modal confirmation content
  const modalConfirm = open ? (
    <GlassPanel
      className="p-8 text-center fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
    >
      <div className="bg-cream dark:bg-darkBrown rounded-[16px] p-8 max-w-sm">
        <h3 className="text-2xl font-bold text-charcoal mb-4">
          Incident Reported
        </h3>
        <p className="text-[--muted] text-sm mb-6">
          Your incident has been reported and a manager will review it.
        </p>
        <button
          onClick={() => setOpen(false)}
          className="bg-espresso text-white px-6 py-3 rounded-full font-medium hover:bg-[--deep-brown] transition-colors"
        >
          OK
        </button>
      </div>
    </GlassPanel>
  ) : null

  return (
    <GlassPanel className="p-6 md:p-12 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-charcoal mb-6">Report Incident</h2>

      {/* Booking selector */}
      {selectedBookingPanel}

      {/* Incident type */}
      <GlassPanel>
        <p className="text-[--muted] text-sm mb-3">Incident Type</p>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setType('damage')}
            className={cn(
              'rounded-md p-2 text-center',
              type === 'damage' ? 'bg-[--error] text-white' : 'bg-softBeige text-eshover',
              'hover:bg-[--taupe] hover:text-white transition-colors'
            )}
          >
            Damage
          </button>
          <button
            onClick={() => setType('delay')}
            className={cn(
              'rounded-md p-2 text-center',
              type === 'delay' ? 'bg-[--warning] text-white' : 'bg-softBeige text-eshover',
              'hover:bg-[--taupe] hover:text-white transition-colors'
            )}
          >
            Delay
          </button>
          <button
            onClick={() => setType('other')}
            className={cn(
              'rounded-md p-2 text-center',
              type === 'other' ? 'bg-[--muted] text-white' : 'bg-softBeige text-eshover',
              'hover:bg-[--taupe] hover:text-white transition-colors'
            )}
          >
            Other
          </button>
        </div>
      </GlassPanel>

      {/* Description */}
      <div>
        <label className="block text-[--muted] text-sm mb-2">Description</label>
        <textarea
          rows={3}
          className="w-full bg-softBeige dark:bg-[--deep-brown] border border-sand rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-espresso resize-none text-sm"
          placeholder="Describe the incident..."
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
      </div>
      </GlassPanel>

      {selectedBookingInfo}

      {/* Submit */}
      {submitButton}

      {/* Modal confirmation */}
      {modalConfirm}
    </GlassPanel>
  )
}
export default Incidents
