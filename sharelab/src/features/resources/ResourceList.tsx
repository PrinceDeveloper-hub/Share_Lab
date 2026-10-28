import { GlassPanel } from '../../components/glass/GlassPanel'
import { cn } from '../../lib/utils'
import { useBookings } from '../../hooks/useBookings'
import { useState } from 'react'

export const ResourceList = () => {
  const { bookings, isLoading } = useBookings()
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
  })

  const resources = [
    {
      id: 1,
      name: 'Ultimaker S5 3D Printer',
      category: '3D Printing & Fab',
      location: 'Lab A',
      description: 'Professional 3D printer with dual extrusion',
      image: '/3d-printer.jpg',
      available: true,
    },
    {
      id: 2,
      name: 'Keysight Oscilloscope',
      category: 'Electronics & Test',
      location: 'Lab B',
      description: '200MHz digital oscilloscope',
      image: '/oscilloscope.jpg',
      available: true,
    },
    {
      id: 3,
      name: 'Sony A7 IV Camera Kit',
      category: 'Media Production',
      location: 'Studio A',
      description: 'Full-frame camera kit with lenses',
      image: '/camera-kit.jpg',
      available: false,
    },
    {
      id: 4,
      name: 'PCR Cycler',
      category: 'Bio & Chemistry',
      location: 'Lab C',
      description: 'Thermal cycler for DNA amplification',
      image: '/pcr-cycler.jpg',
      available: true,
    },
    {
      id: 5,
      name: 'Laser Cutter',
      category: 'Fabrication',
      location: 'Fab Lab',
      description: 'Industrial 100W laser cutter',
      image: '/laser-cutter.jpg',
      available: true,
    },
    {
      id: 6,
      name: 'Collaborative Conference Room',
      category: 'Collaborative Spaces',
      location: 'Building 1',
      description: 'Room for 8-10 people with whiteboard',
      image: '/conference-room.jpg',
      available: true,
    },
  ]

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value })
  }

  const handleCategoryChange = (category: string) => {
    setFilters({ ...filters, category })
  }

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      resource.description.toLowerCase().includes(filters.search.toLowerCase())
    const matchesCategory =
      filters.category === 'all' || resource.category === filters.category
    const matchesStatus =
      filters.status === 'all' || (resource.available ? 'available' : 'unavailable')

    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <GlassPanel className="p-6 md:p-12">
      <h1 className="text-3xl font-bold text-charcoal mb-2">Resources</h1>
      <p className="text-muted mb-8">Find and book the best equipment and spaces for your work.</p>

      {/* Search and filters */}
      <GlassPanel className="mb-8 p-4 rounded-[12px]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {/* Search */}
          <div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search 3D printers, oscilloscopes, camera rigs, rooms..."
                value={filters.search}
                onChange={handleSearch}
                className="flex-1 bg-softBeige dark:bg-[--deep-brown] border border-sand rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-espresso transition-colors"
              />
            </div>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-softBeige dark:bg-[--deep-brown] border border-sand rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-espresso appearance-none cursor-pointer"
            >
              <option value="all">Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          {/* Category pills */}
          <div>
            <div className="flex flex-wrap gap-2">
              <button
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md border ',
                  filters.category === 'all' ? 'bg-espresso text-white' : 'bg-softBeige text-espresso hover:bg-[--taupe] hover:text-white transition-colors',
                  'data-[category="3D+Printing+%26+Fab"]:bg-[--taupe] data-[category="Electronics+%26+Test"]:bg-[--taupe] data-[category="Media+Production"]:bg-[--taupe] data-[category="Bio+%26+Chemistry"]:bg-[--taupe] data-[category="Laser+%26+CNC"]:bg-[--taupe] data-[category="Collaborative+Spaces"]:bg-[--taupe]'
                )}
                onClick={() => handleCategoryChange('all')}
              >
                All
              </button>
              {/* Simplified - in real app would map over categories */}
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Resource grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
        {filteredResources.map((resource) => (
          <GlassPanel
            key={resource.id}
            className="p-4 rounded-[12px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow"
          >
            <img
              src={resource.image}
              alt={resource.name}
              className="w-full h-40 object-cover rounded-[8px] mb-4"
              style={{ background: 'var(--ivory)' }}
            />
            <h3 className="text-sm font-medium text-charcoal mb-1">{resource.name}</h3>
            <p className="text-[--taupe] text-xs mb-2">{resource.category}</p>
            <p className="text-[--muted] text-xs">{resource.location}</p>
            <span className="mt-2">
              {resource.available ? (
                <span className="bg-[--success] text-white text-xs px-2 py-1 rounded">Available</span>
              ) : (
                <span className="bg-[--warning] text-white text-xs px-2 py-1 rounded">Unavailable</span>
              )}
            </span>
            <button
              className="mt-3 w-full bg-espresso text-white px-3 py-2 rounded text-sm hover:bg-[--deep-brown] transition-colors"
              onClick={() => window.location.href = `/resources/${resource.id}`}
            >
              View Details
            </button>
          </GlassPanel>
        ))}
      </div>

      {isLoading && <p className="mt-8 text-center">Loading resources...</p>}
    </GlassPanel>
  )
}