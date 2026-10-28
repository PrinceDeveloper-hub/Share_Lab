import { createFileRoute } from '@tanstack/react-router'
import { HowItWorksPage } from '../features/how-it-works/HowItWorksPage'

export const Route = createFileRoute('/how-it-works')({
  component: HowItWorksPage,
})
