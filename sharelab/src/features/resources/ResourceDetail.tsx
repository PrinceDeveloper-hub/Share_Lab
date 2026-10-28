import { GlassPanel } from '../../components/glass/GlassPanel'
import { cn } from '../../lib/utils'
import { useBookings } from '../../hooks/useBookings'
import { useState, useEffect } from 'react'

export interface Resource {
  id: number
  name: string
  category: string
  location: string
  description: string
  image: string
  rules: string
  max_hours_per_booking: number
  weekly_cap_hours: number
  status: 'active' | 'inactive'
  owner: string
}

interface ResourceDetailProps {
  params: {
    resourceId: string
  }
}

export const ResourceDetail = ({ params }: ResourceDetailProps) => {
  const resourceId = parseInt(params.resourceId)
  const { checkEligibility } = useBookings()
  const [eligibility, setEligibility] = useState<{
    qualifies: boolean
    message: string
    checklist: { name: string; status: string }[]
  } | null>(null)
  const [loadingEligibility, setLoadingEligibility] = useState(false)
  const [open, setOpen] = useState(false)

  // Fetch resource details and eligibility
  useEffect(() => {
    const loadResource = async () => {
      setLoadingEligibility(true)
      try {
        const response = await checkEligibility(
          resourceId,
          '2026-11-01T09:00:00',
          '2026-11-01T11:00:00'
        )
        setEligibility(response)
        setLoadingEligibility(false)
      } catch (error) {
        setLoadingEligibility(false)
      }
    }

    loadResource()
  }, [resourceId, checkEligibility])

  // Mock resource data - in real app would fetch from API
  const resource: Resource = {
    id: resourceId,
    name: resourceId === 1 ? 'Ultimaker S5 3D Printer' : resourceId === 2 ? 'Keysight Oscilloscope' : 'Camera Kit',
    category: resourceId === 1 ? '3D Printing & Fab' : resourceId === 2 ? 'Electronics & Test' : 'Photography',
    location: 'Lab A',
    description: 'Resource description',
    image: `/resource-${resourceId}.jpg`,
    rules: resourceId === 1 ? 'Must have completed 3D Printer Training' : 'Must have completed safety training',
    max_hours_per_booking: 2,
    weekly_cap_hours: 6,
    status: 'active',
    owner: 'Physics Department',
  }

  // Handle eligibility check response
  const handleEligibilityChange = () => {
    if (eligibility) {
      setOpen(!open)
    }
  }

  return (
    <GlassPanel className="p-6 md:p-12 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Left: Resource info */}
        <div>
          <GlassPanel className="p-6 rounded-[16px] mb-6">
            <h2 className="text-2xl font-bold text-charcoal mb-4">{resource.name}</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-[--taupe] text-sm mb-1">Category</p>
                <p className="font-medium text-espresso">{resource.category}</p>
              </div>
              <div>
                <p className="text-[--taupe] text-sm mb-1">Location</p>
                <p className="font-medium text-espresso">{resource.location}</p>
              </div>
            </div>

            <p className="text-[--muted] text-sm mb-6">{resource.description}</p>

            {/* Requirements */}
            <GlassPanel className="p-4 mb-6">
              <p className="text-[--taupe] font-medium text-sm mb-2">Requirements</p>
              <p className="text-[--muted] text-sm">{resource.rules}</p>
            </GlassPanel>

            {/* Cap info */}
            <div className="mt-4 p-3 bg-[--soft-beige] rounded-[8px]">
              <p className="text-[--taupe] text-sm mb-1">Booking Limits</p>
              <p className="text-sm">
                Max per booking: <span className="font-medium">{resource.max_hours_per_booking} hours</span> |
                Weekly cap: <span className="font-medium">{resource.weekly_cap_hours} hours</span>
              </p>
            </div>
          </GlassPanel>

          {/* Eligibility panel */}
          {eligibility && (
            <GlassPanel className="p-5 mb-6">
              <h3 className="text-lg font-semibold text-charcoal mb-3">Check Eligibility</h3>
              <div className="space-y-3">
                {!eligibility.qualifies && (
                  <GlassPanel
                    className="bg-[--warning] text-[--charcoal] px-4 py-3 rounded-md"
                  >
                    <p className="font-medium mb-1">Missing requirements:</p>
                    <p className="text-sm">{eligibility.message}</p>
                  </GlassPanel>
                )}

                {eligibility.qualifies && (
                  <GlassPanel
                    className="bg-[--success] text-[--charcoal] px-4 py-3 rounded-md"
                  >
                    <p className="font-medium">You qualify for this resource!</p>
                  </GlassPanel>
                )}

                <div>
                  <p className="text-[--muted] text-xs">Required credentials:</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="text-[--muted] text-xs">3D Printer Training</span>
                      <span className="text-[--muted] text-xs">pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassPanel>
          )}

          {/* Booking panel */}
          <GlassPanel>
            <h3 className="text-lg font-semibold text-charcoal mb-4">Request Booking</h3>

            <form
              className="space-y-4"
              onSubmit={async (e: React.FormEvent) => {
                e.preventDefault()
                if (!eligibility?.qualifies) {
                  alert('You must meet all eligibility requirements before booking')
                  return
                }
                setOpen(true)
              }}
            >
              {/* Date/Time selection */}
              <div>
                <label className="block text-sm text-[--muted] mb-1">Date</label>
                <input
                  type="date"
                  className="w-full bg-softBeige dark:bg-[--deep-brown] border border-sand rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-espresso"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm text-[--muted] mb-1">Duration (hours)</label>
                <input
                  type="number"
                  min="1"
                  max={resource.max_hours_per_booking}
                  className="w-full bg-softBeige dark:bg-[--deep-brown] border border-sand rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-espresso"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm text-[--muted] mb-1">Purpose</label>
                <textarea
                  rows={3}
                  className="w-full bg-softBeige dark:bg-[--deep-brown] border border-sand rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-espresso resize-none text-sm"
                  placeholder="Enter the purpose of your booking..."
                ></textarea>
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  className="w-full bg-espresso text-white px-6 py-3 rounded-full font-medium hover:bg-[--deep-brown] transition-colors"
                >
                  Request Booking
                </button>
              </div>
            </form>
          </GlassPanel>
        </div>

        {/* Right: Calendar/slots */}
        <div className="space-y-6">
          <GlassPanel>
            <h3 className="text-lg font-semibold text-charcoal mb-3">Available Slots</h3>
            <div className="space-y-2">
              <div className="px-3 py-2 rounded-md bg-[--soft-beige] text-sm">
                09:00 AM - 11:00 AM (2h)
              </div>
              <div className="px-3 py-2 rounded-md bg-[--soft-beige] text-sm">
                01:00 PM - 03:00 PM (2h)
              </div>
              <div className="px-3 py-2 rounded-md bg-[--soft-beige] text-sm opacity-50">
                02:00 PM - 04:00 PM (2h) - Unavailable
              </div>
            </div>
          </GlassPanel>

          <GlassPanel>
            <h3 className="text-lg font-semibold text-charcoal mb-3">Weekly Hours Summary</h3>
            <div className="space-y-2">
              <div className="px-3 py-2 rounded-md bg-[--soft-beige] text-sm">
                Used this week: 2 of 6 hours
              </div>
              <div className="px-3 py-2 rounded-md bg-[--soft-beige] text-sm">
                Remaining: 4 hours
              </div>
            </div>
          </GlassPanel>
        </div>

      </div>
    </GlassPanel>
  )
}

export default ResourceDetail
