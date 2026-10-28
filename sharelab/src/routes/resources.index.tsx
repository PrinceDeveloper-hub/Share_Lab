import { createFileRoute } from '@tanstack/react-router'
import { ResourcesPage } from '../features/resources/ResourcesPage'

export const Route = createFileRoute('/resources/')({
  component: ResourcesPage,
})
