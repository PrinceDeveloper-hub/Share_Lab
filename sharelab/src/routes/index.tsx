import { Home } from '../features/home/Home'
import { ResourceList } from '../features/resources/ResourceList'
import { ResourceDetail } from '../features/resources/ResourceDetail'
import { MyBookings } from '../features/bookings/MyBookings'
import { Dashboard } from '../features/dashboard/Dashboard'
import { Login } from '../features/auth/Login'
import { routeTree } from '../routeTree.gen.ts'

export const Route = createRootRoute({
  component: Home,
  evaluatePathname: true,
})

Route.getRouteTree = () => routes

Route.children = [
  {
    path: '/login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/resources',
    component: ResourceList,
    meta: { requiresAuth: true },
  },
  {
    path: '/resources/:resourceId',
    component: ResourceDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/my-bookings',
    component: MyBookings,
    meta: { requiresAuth: true },
  },
  {
    path: '/my-bookings/:bookingId',
    component: MyBookings,
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/owner',
    component: Dashboard,
    meta: { requiresAuth: true, role: 'owner' },
  },
  {
    path: '/manager',
    component: Dashboard,
    meta: { requiresAuth: true, role: 'manager' },
  },
  {
    path: '/admin',
    component: Dashboard,
    meta: { requiresAuth: true, role: 'admin' },
  },
]

export default Route