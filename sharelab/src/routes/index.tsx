import { createFileRoute } from '@tanstack/react-router'
import { Home } from '../features/home/Home'

export const Route = createFileRoute('/')({
  component: Home,
})
