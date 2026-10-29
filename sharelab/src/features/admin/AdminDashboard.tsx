import { GlassPanel } from '../../components/glass/GlassPanel'
import { cn } from '../../lib/utils'
import { useState } from 'react'

export const AdminDashboard = () => {
  const [section, setSection] = useState<
    'dashboard' | 'users' | 'resources' | 'bookings' | 'audit'
  >('dashboard')

  // Dashboard overview
  const overview = {
    totalUsers: 124,
    totalResources: 6,
    totalBookings: 89,
    activeIncidents: 3,
  }

  // Users data
  const users = [
    {
      id: 1,
      name: 'Alex Morgan',
      email: 'alex@university.edu',
      role: 'user',
      status: 'active',
    },
    {
      id: 2,
      name: 'Dr. Chen',
      email: 'chen@university.edu',
      role: 'owner',
      status: 'active',
    },
    {
      id: 3,
      name: 'Sarah Park',
      email: 'sarah@university.edu',
      role: 'manager',
      status: 'active',
    },
  ]

  // Resources data
  const resources = [
    {
      id: 1,
      name: '3D Printer',
      owner: 'Physics Dept',
      category: 'Fab',
      status: 'active',
    },
    {
      id: 2,
      name: 'Oscilloscope',
      owner: 'EE Dept',
      category: 'Test',
      status: 'active',
    },
  ]

  // Audit entries
  const auditEntries = [
    {
      id: 1,
      action: 'booking_approved',
      actor: 'Sarah Park',
      timestamp: '2026-11-01 10:30',
      booking: '#12',
      reason: 'Eligible, no conflicts',
    },
    {
      id: 2,
      action: 'check_in',
      actor: 'Alex Morgan',
      timestamp: '2026-11-02 09:15',
      booking: '#15',
      reason: 'Checked in on time',
    },
  ]

  return (
    <GlassPanel className="p-6 md:p-12 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-charcoal mb-6">Admin Dashboard</h1>

      {/* Overview section */}
      {section === 'dashboard' && (
        <GlassPanel className="mb-8">
          <h2 className="text-xl font-semibold text-charcoal mb-6">Overview</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassPanel className="p-4 rounded-lg">
              <p className="text-(--muted) text-sm mb-2">Total Users</p>
              <p className="text-3xl font-bold text-charcoal">
                {overview.totalUsers}
              </p>
            </GlassPanel>
            <GlassPanel className="p-4 rounded-lg">
              <p className="text-(--muted) text-sm mb-2">
                Total Resources
              </p>
              <p className="text-3xl font-bold text-charcoal">
                {overview.totalResources}
              </p>
            </GlassPanel>
            <GlassPanel className="p-4 rounded-lg">
              <p className="text-(--muted) text-sm mb-2">Total Bookings</p>
              <p className="text-3xl font-bold text-charcoal">
                {overview.totalBookings}
              </p>
            </GlassPanel>
            <GlassPanel className="p-4 rounded-lg">
              <p className="text-(--muted) text-sm mb-2">
                Active Incidents
              </p>
              <p className="text-3xl font-bold text-error">
                {overview.activeIncidents}
              </p>
            </GlassPanel>
          </div>
        </GlassPanel>
      )}

      {/* Users section */}
      {section === 'users' && (
        <GlassPanel className="mb-8">
          <h2 className="text-xl font-semibold text-charcoal mb-4">Users</h2>{' '}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-sand">
                  <th className="p-3 text-left text-sm font-medium text-charcoal">
                    Name
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-charcoal">
                    Email
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-charcoal">
                    Role
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-charcoal">
                    Status
                  </th>
                  <th className="p-3 text-right text-sm font-medium text-charcoal">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-sand">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <span
                        className={cn(
                          'px-2 py-1 rounded text-xs',
                          user.role === 'admin'
                            ? 'bg-(--error) text-white'
                            : user.role === 'manager'
                              ? 'bg-(--warning) text-white'
                              : 'bg-(--success) text-white',
                        )}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          'px-2 py-1 rounded text-xs',
                          user.status === 'active'
                            ? 'bg-(--success) text-(--charcoal)'
                            : 'bg-(--muted) text-(--charcoal)',
                        )}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-(--taupe) text-sm hover:text-espresso transition-colors">
                        Edit
                      </button>
                      <button className="text-(--error) text-sm hover:text-red-400 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      )}

      {/* Resources section */}
      {section === 'resources' && (
        <GlassPanel className="mb-8">
          <h2 className="text-xl font-semibold text-charcoal mb-4">
            Resources
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-sand">
                  <th className="p-3 text-left text-sm font-medium text-charcoal">
                    Resource
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-charcoal">
                    Owner
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-charcoal">
                    Category
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-charcoal">
                    Status
                  </th>
                  <th className="p-3 text-right text-sm font-medium text-charcoal">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource) => (
                  <tr key={resource.id} className="border-b border-sand">
                    <td className="p-3">{resource.name}</td>
                    <td className="p-3">{resource.owner}</td>
                    <td className="p-3 text-(--taupe) text-sm">
                      {resource.category}
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          'px-2 py-1 rounded text-xs',
                          resource.status === 'active'
                            ? 'bg-(--success) text-(--charcoal)'
                            : 'bg-(--muted) text-(--charcoal)',
                        )}
                      >
                        {resource.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-(--taupe) text-sm hover:text-espresso transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      )}

      {/* Audit section */}
      {section === 'audit' && (
        <GlassPanel>
          <h2 className="text-xl font-semibold text-charcoal mb-6">
            Audit Log
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-sand">
                  <th className="p-3 text-left text-sm font-medium text-charcoal">
                    Timestamp
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-charcoal">
                    Actor
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-charcoal">
                    Action
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-charcoal">
                    Booking
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-charcoal">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-sand">
                    <td className="p-3 text-(--muted) text-sm">
                      {entry.timestamp}
                    </td>
                    <td className="p-3">{entry.actor}</td>
                    <td className="p-3 text-(--taupe) text-sm">
                      {entry.action}
                    </td>
                    <td className="p-3 text-(--muted) text-sm">
                      {entry.booking}
                    </td>
                    <td className="p-3 text-(--muted) text-sm">
                      {entry.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      )}

      {/* Navigation tabs */}
      <div className="grid grid-cols-5 mb-6">
        <button
          onClick={() => setSection('dashboard')}
          className={cn(
            'flex-1 rounded-md border px-3 py-2 text-sm font-medium ',
            section === 'dashboard'
              ? 'bg-espresso text-white'
              : 'bg-soft-beige text-espresso hover:bg-(--taupe) hover:text-white transition-colors',
          )}
        >
          Dashboard
        </button>
        <button
          onClick={() => setSection('users')}
          className={cn(
            'flex-1 rounded-md border px-3 py-2 text-sm font-medium ',
            section === 'users'
              ? 'bg-espresso text-white'
              : 'bg-soft-beige text-espresso hover:bg-(--taupe) hover:text-white transition-colors',
          )}
        >
          Users
        </button>
        <button
          onClick={() => setSection('resources')}
          className={cn(
            'flex-1 rounded-md border px-3 py-2 text-sm font-medium ',
            section === 'resources'
              ? 'bg-espresso text-white'
              : 'bg-soft-beige text-espresso hover:bg-(--taupe) hover:text-white transition-colors',
          )}
        >
          Resources
        </button>
        <button
          onClick={() => setSection('bookings')}
          className={cn(
            'flex-1 rounded-md border px-3 py-2 text-sm font-medium ',
            section === 'bookings'
              ? 'bg-espresso text-white'
              : 'bg-soft-beige text-espresso hover:bg-(--taupe) hover:text-white transition-colors',
          )}
        >
          Bookings
        </button>
        <button
          onClick={() => setSection('audit')}
          className={cn(
            'flex-1 rounded-md border px-3 py-2 text-sm font-medium ',
            section === 'audit'
              ? 'bg-espresso text-white'
              : 'bg-soft-beige text-espresso hover:bg-(--taupe) hover:text-white transition-colors',
          )}
        >
          Audit Log
        </button>
      </div>
    </GlassPanel>
  )
}
export default AdminDashboard
