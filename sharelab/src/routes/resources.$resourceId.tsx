import { createFileRoute } from '@tanstack/react-router'
import { ResourceDetail } from '../features/resources/ResourceDetail'

const ResourceDetailRoute = () => {
  const { resourceId } = Route.useParams()
  return <ResourceDetail resourceId={resourceId} />
}

export const Route = createFileRoute('/resources/$resourceId')({
  component: ResourceDetailRoute,
})
