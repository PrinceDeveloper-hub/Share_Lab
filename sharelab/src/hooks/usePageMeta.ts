import { useEffect } from 'react'

interface PageMeta {
  title: string
  description?: string
}

const ensureDescription = () => {
  let element = document.querySelector<HTMLMetaElement>('meta[name="description"]')

  if (!element) {
    element = document.createElement('meta')
    element.name = 'description'
    document.head.appendChild(element)
  }

  return element
}

export const usePageMeta = ({ title, description }: PageMeta) => {
  useEffect(() => {
    document.title = title

    if (description) {
      ensureDescription().content = description
    }
  }, [title, description])
}
