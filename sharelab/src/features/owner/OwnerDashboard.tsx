import { GlassPanel } from '../../components/glass/GlassPanel'
import { cn } from '../../lib/utils'

export const OwnerDashboard = () => {
  const resources = [
    {
      id: 1,
      name: 'Ultimaker S5 3D Printer',
      category: '3D Printing & Fab',
      location: 'Lab A',
      description: 'Professional 3D printer with dual extrusion',
      owner: 'Physics Department',
      status: 'active',
      availability: 'Available 9am-5pm',
      maxHours: 2,
      weeklyCap: 6,
      requirements: '3D Printer Training',
    },
    {
      id: 2,
      name: 'Keysight Oscilloscope',
      category: 'Electronics & Test',
      location: 'Lab B',
      description: '200MHz digital oscilloscope',
      owner: 'EE Department',
      status: 'active',
      availability: 'Available 8am-6pm',
      maxHours: 3,
      weeklyCap: 8,
      requirements: 'Oscilloscope Safety',
    },
    {
      id: 3,
      name: 'Sony A7 IV Camera Kit',
      category: 'Media Production',
      location: 'Studio A',
      description: 'Full-frame camera kit with lenses',
      owner: 'Film Department',
      status: 'active',
      availability: 'Available 10am-4pm',
      maxHours: 4,
      weeklyCap: 10,
      requirements: 'Camera Orientation',
    },
  ]

  return (
    <GlassPanel className="p-6 md:p-12 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-charcoal mb-4">My Resources</h1>

      <GlassPanel className="mb-6">
        <h2 className="text-xl font-semibold text-charcoal mb-4">Add New Resource</h2>

        <form className="space-y-4">
          <div>
            <label className="block text-[--muted] text-sm mb-2">Resource Name</label>
            <input
              type="text"
              className="w-full bg-softBeige dark:bg-[--deep-brown] border border-sand rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-espresso"
              placeholder="e.g. Ultimaker S5 3D Printer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[--muted] text-sm mb-2">Category</label>
              <select className="w-full bg-softBeige dark:bg-[--deep-brown] border border-sand rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-espresso">
                <option value="3D Printing & Fab">3D Printing & Fab</option>
                <option value="Electronics & Test">Electronics & Test</option>
                <option value="Photography">Photography</option>
                <option value="Bio & Chemistry">Bio & Chemistry</option>
                <option value="Fabrication">Fabrication</option>
                <option value="Collaborative Spaces">Collaborative Spaces</option>
              </select>
            </div>
            <div>
              <label className="block text-[--muted] text-sm mb-2">Location</label>
              <input
                type="text"
                className="w-full bg-softBeige dark:bg-[--deep-brown] border border-sand rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-espresso"
                placeholder="e.g. Lab A"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[--muted] text-sm mb-2">Max Hours per Booking</label>
              <input
                type="number"
                className="w-full bg-softBeige dark:bg-[--deep-brown] border border-sand rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-espresso"
                min="1"
              />
            </div>
            <div>
              <label className="block text-[--muted] text-sm mb-2">Weekly Cap (hours)</label>
              <input
                type="number"
                className="w-full bg-softBeige dark:bg-[--deep-brown] border border-sand rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-espresso"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-[--muted] text-sm mb-2">Rules/Requirements</label>
            <textarea
              rows={3}
              className="w-full bg-softBeige dark:bg-[--deep-brown] border border-sand rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-espresso resize-none text-sm"
              placeholder="e.g. Must have completed 3D Printer Training"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-espresso text-white px-6 py-3 rounded-full font-medium hover:bg-[--deep-brown] transition-colors"
          >
            Create Resource
          </button>
        </form>
      </GlassPanel>

      {/* Resources table */}
      <GlassPanel>
        <h2 className="text-xl font-semibold text-charcoal mb-4">My Resources</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-sand">
                <th className="p-3 text-left text-sm font-medium text-charcoal">Resource</th>
                <th className="p-3 text-left text-sm font-medium text-charcoal">Category</th>
                <th className="p-3 text-left text-sm font-medium text-charcoal">Location</th>
                <th className="p-3 text-left text-sm font-medium text-charcoal">Status</th>
                <th className="p-3 text-right text-sm font-medium text-charcoal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id} className="border-b border-sand">
                  <td className="p-3">
                    <img
                      src={`/resource-${resource.id}.jpg`}
                      alt={resource.name}
                      className="w-8 h-8 rounded-md object-cover mr-3"
                    />
                    <span>{resource.name}</span>
                  </td>
                  <td className="p-3 text-[--taupe] text-sm">{resource.category}</td>
                  <td className="p-3 text-[--taupe] text-sm">{resource.location}</td>
                  <td className="p-3">
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-xs',
                        resource.status === 'active' ? 'bg-[--success] text-[--charcoal]' : 'bg-[--muted] text-[--charcoal]'
                      )}
                    >
                      {resource.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      className="text-[--taupe] text-sm hover:text-espresso transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      className="text-[--error] text-sm hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
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
export default OwnerDashboard