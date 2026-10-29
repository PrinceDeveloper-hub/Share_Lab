import type { Page } from '@playwright/test'
import type { User } from '../../src/lib/api-client'
import type {
  Booking,
  BookingConditionReport,
  ConditionLevel,
} from '../../src/lib/booking-service'
import type { Resource } from '../../src/lib/resources'

/**
 * Network mock for the ShareLab API. Every request under /api is answered
 * here, so the Playwright suite can drive real routes, guards and mutations
 * without running the Laravel backend.
 */

export interface ApiCall {
  method: string
  path: string
  body: unknown
}

export interface MockApiOptions {
  user?: User | null
  bookings?: Booking[]
  queue?: Booking[]
  resources?: Resource[]
}

export const memberUser: User = {
  id: 7,
  name: 'Maya Chen',
  email: 'maya.chen@campus.edu',
  role: 'user',
}

export const managerUser: User = {
  id: 3,
  name: 'Rowan Patel',
  email: 'rowan.patel@campus.edu',
  role: 'manager',
}

export const demoResource: Resource = {
  id: 1,
  name: 'Confocal Microscope',
  category: 'Imaging',
  location: 'Biosciences Building, Room 2.14',
  description: 'Laser scanning confocal microscope for live-cell imaging.',
  rules: 'Training required. Book at most four hours per day.',
  max_hours_per_booking: 4,
  weekly_cap_hours: 8,
  status: 'active',
  owner: { id: 3, name: 'Rowan Patel' },
}

const checkInReport: BookingConditionReport = {
  id: 11,
  booking_id: 2,
  type: 'checkin',
  condition: 'excellent',
  notes: 'All lenses present, stage clean.',
  checklist: null,
  reported_by: 7,
  reporter: { id: 7, name: 'Maya Chen' },
  reported_at: '2026-10-28T09:05:00.000Z',
}

export const memberBookings: Booking[] = [
  {
    id: 1,
    resource_id: 1,
    user_id: 7,
    start_at: '2026-11-02T09:00:00.000Z',
    end_at: '2026-11-02T11:00:00.000Z',
    purpose: 'Cell imaging for thesis chapter three.',
    status: 'approved',
    decision_reason: 'Approved for supervised use.',
    priority_score: 78.5,
    priority_explanation: 'Verified training and no late returns.',
    waitlist_position: null,
    confirm_by: null,
    is_late: false,
    check_in_report: null,
    return_report: null,
  },
  {
    id: 2,
    resource_id: 1,
    user_id: 7,
    start_at: '2026-10-28T09:00:00.000Z',
    end_at: '2026-10-28T11:00:00.000Z',
    purpose: 'Live-cell imaging pilot.',
    status: 'checked_in',
    decision_reason: 'Approved for supervised use.',
    priority_score: 78.5,
    priority_explanation: 'Verified training and no late returns.',
    waitlist_position: null,
    confirm_by: null,
    is_late: false,
    check_in_report: checkInReport,
    return_report: null,
  },
]

export const pendingQueue: Booking[] = [
  {
    id: 4,
    resource_id: 1,
    user_id: 9,
    start_at: '2026-11-04T13:00:00.000Z',
    end_at: '2026-11-04T15:00:00.000Z',
    purpose: 'Calibration run for the microscopy workshop.',
    status: 'pending',
    decision_reason: null,
    priority_score: 64,
    priority_explanation: 'Coursework deadline this week.',
    waitlist_position: null,
    confirm_by: null,
    is_late: false,
    user: { id: 9, name: 'Mia Torres', email: 'mia.torres@campus.edu' },
    check_in_report: null,
    return_report: null,
  },
]

const reportFor = (
  booking: Booking,
  type: 'checkin' | 'return',
  condition: ConditionLevel,
  notes: string | undefined,
): BookingConditionReport => ({
  id: type === 'checkin' ? 21 : 22,
  booking_id: booking.id,
  type,
  condition,
  notes: notes?.trim() ? notes.trim() : null,
  checklist: null,
  reported_by: booking.user_id,
  reporter: { id: booking.user_id, name: 'Maya Chen' },
  reported_at: '2026-10-29T10:00:00.000Z',
})

export const mockApi = async (
  page: Page,
  options: MockApiOptions = {},
): Promise<{ calls: ApiCall[] }> => {
  const calls: ApiCall[] = []
  const user = options.user === undefined ? memberUser : options.user
  const bookings = options.bookings ?? memberBookings
  const queue = options.queue ?? pendingQueue
  const resources = options.resources ?? [demoResource]

  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.replace(/^.*?\/api/, '')
    const method = request.method()

    let body: unknown = null
    try {
      body = request.postDataJSON()
    } catch {
      body = null
    }

    calls.push({ method, path, body })

    const json = (payload: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(payload),
      })

    const allBookings = [...bookings, ...queue]
    const bookingIdMatch = path.match(/^\/bookings\/(\d+)\/(checkin|return)$/)

    if (path === '/me') {
      return user
        ? json({ data: user, message: 'Authenticated.' })
        : json({ message: 'Unauthenticated.' }, 401)
    }

    if (path === '/login' && method === 'POST') {
      return json({
        data: { user: options.user ?? memberUser },
        message: 'Signed in.',
      })
    }

    if (path === '/logout') {
      return json({ message: 'Signed out.' })
    }

    if (path === '/bookings' && method === 'GET') {
      return json({
        data: bookings,
        message: 'Bookings retrieved successfully.',
        meta: { page: 1, per_page: 10, total: bookings.length, last_page: 1 },
      })
    }

    if (path === '/manager/bookings' && method === 'GET') {
      return json({
        data: {
          data: queue,
          meta: { page: 1, per_page: 20, total: queue.length, last_page: 1 },
        },
        message: 'Booking queue retrieved successfully.',
        meta: { page: 1, per_page: 20, total: queue.length, last_page: 1 },
      })
    }

    const decisionMatch = path.match(/^\/bookings\/(\d+)\/decision$/)
    if (decisionMatch && method === 'PATCH') {
      const booking = allBookings.find(
        (item) => item.id === Number(decisionMatch[1]),
      )
      const decision = (body as { decision?: string } | null)?.decision

      return json({
        data: booking
          ? {
              ...booking,
              status:
                decision === 'approve'
                  ? 'approved'
                  : decision === 'waitlist'
                    ? 'waitlisted'
                    : 'rejected',
            }
          : null,
        message: 'Booking decision recorded.',
      })
    }

    if (bookingIdMatch && method === 'POST') {
      const booking = allBookings.find(
        (item) => item.id === Number(bookingIdMatch[1]),
      )

      if (!booking) {
        return json({ data: null, message: 'Booking not found.' }, 404)
      }

      const payload = (body ?? {}) as {
        condition: ConditionLevel
        notes?: string
      }
      const type = bookingIdMatch[2] === 'checkin' ? 'checkin' : 'return'

      return json({
        data: {
          ...booking,
          status: type === 'checkin' ? 'checked_in' : 'returned',
          is_late: type === 'return',
          ...(type === 'checkin'
            ? {
                check_in_report: reportFor(
                  booking,
                  'checkin',
                  payload.condition,
                  payload.notes,
                ),
              }
            : {
                return_report: reportFor(
                  booking,
                  'return',
                  payload.condition,
                  payload.notes,
                ),
              }),
        },
        message:
          type === 'checkin'
            ? 'Check-in completed successfully.'
            : 'Items returned successfully.',
      })
    }

    if (path === '/resources' && method === 'GET') {
      return json({
        data: resources,
        message: 'Resources retrieved successfully.',
        meta: {
          page: 1,
          per_page: 100,
          total: resources.length,
          last_page: 1,
        },
      })
    }

    if (/^\/resources\/\d+$/.test(path) && method === 'GET') {
      const id = Number(path.split('/').pop())
      const resource = resources.find((item) => item.id === id) ?? resources[0]
      return json({
        data: resource,
        message: 'Resource retrieved successfully.',
      })
    }

    if (path === '/credentials' || path === '/incidents') {
      return json({
        data: { data: [], meta: { total: 0 } },
        message: 'OK',
        meta: { page: 1, per_page: 10, total: 0, last_page: 1 },
      })
    }

    return json({ data: [], message: 'OK' })
  })

  return { calls }
}
