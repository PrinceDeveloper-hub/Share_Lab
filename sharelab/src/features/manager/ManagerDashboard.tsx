import { GlassPanel } from '../../components/glass/GlassPanel'
import { cn } from '../../lib/utils'
import { useState } from 'react'

export const ManagerDashboard = () => {
  const [tab, setTab] = useState<'pending' | 'approved' | 'waitlisted' | 'all'>('pending')

  const requests = [    {
      id: 1,
      resource: 'Ultimaker S5 3D Printer',
      user: 'Student User',
      time: '2026-11-01 09:00-11:00',
      purpose: '3D printing prototype',
      priorityScore: 2,
      priorityExplanation: '2 hours used in last 30 days',
    },
    {
      id: 2,
      resource: 'Keysight Oscilloscope',
      user: 'Researcher User',
      time: '2026-11-02 14:00-16:00',
      purpose: 'Signal analysis',
      priorityScore: 0,
      priorityExplanation: '0 hours used in last 30 days - highest priority',
    },
  ]

  return (
    <GlassPanel className="p-6 md:p-12 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-charcoal mb-4">Request Queue</h1>

      {/* Tab navigation */}
      <div className="grid grid-cols-4 mb-6">
        <button
          onClick={() => setTab('pending')}
          className={cn(
            'flex-1 rounded-md border px-3 py-2 text-sm font-medium ',
            tab === 'pending' ? 'bg-espresso text-white' : 'bg-softBeige text-espresso hover:bg-[--taupe] hover:text-white transition-colors'
          )}
        >
          Pending ({requests.filter((r) => r.id === 1 ? r.priorityScore : 0).length})
        </button>
        <button
          onClick={() => setTab('approved')}
          className={cn(
            'flex-1 rounded-md border px-3 py-2 text-sm font-medium ',
            tab === 'approved' ? 'bg-espresso text-white' : 'bg-softBeige text-espresso hover:bg-[--taupe] hover:text-white transition-colors'
          )}
        >
          Approved
        </button>
        <button
          onClick={() => setTab('waitlisted')}
          className={cn(
            'flex-1 rounded-md border px-3 py-2 text-sm font-medium ',
            tab === 'waitlisted' ? 'bg-espresso text-white' : 'bg-softBeige text-espresso hover:bg-[--taupe] hover:text-white transition-colors'
          )}
        >
          Waitlisted
        </button>
        <button
          onClick={() => setTab('all')}
          className={cn(
            'flex-1 rounded-md border px-3 py-2 text-sm font-medium ',
            tab === 'all' ? 'bg-espresso text-white' : 'bg-softBeige text-espresso hover:bg-[--taupe] hover:text-white transition-colors'
          )}
        >
          All
        </button>
      </div>

      {/* Requests table */}
      <GlassPanel>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-sand">
                <th className="p-3 text-left text-sm font-medium text-charcoal">Resource</th>
                <th className="p-3 text-left text-sm font-medium text-charcoal">User</th>
                <th className="p-3 text-left text-sm font-medium text-charcoal">Time</th>
                <th className="p-3 text-left text-sm font-medium text-charcoal">Purpose</th>
                <th className="p-3 text-left text-sm font-medium text-charcoal">Priority</th>
                <th className="p-3 text-right text-sm font-medium text-charcoal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-b border-sand">
                  <td className="p-3">
                    <span>{request.resource}</span>
                  </td>
                  <td className="p-3">
                    <span>{request.user}</span>
                  </td>
                  <td className="p-3">
                    <span>{request.time}</span>
                  </td>
                  <td className="p-3">
                    <span>{request.purpose}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 rounded text-xs bg-[--soft-beige] text-[--muted]">
                      {request.priorityScore}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2">
                      <button
                        className="text-[--taupe] text-sm hover:text-espresso transition-colors px-2 py-1 rounded"
                      >
                        Approve
                      </button>
                      <button
                        className="text-[--error] text-sm hover:text-red-400 transition-colors px-2 py-1 rounded"
                      >
                        Reject
                      </button>
                      <button
                        className="text-[--warning] text-sm hover:text-amber-400 transition-colors px-2 py-1 rounded"
                      >
                        Waitlist
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </GlassPanel>
  )
}
export default ManagerDashboard