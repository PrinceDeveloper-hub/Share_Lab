/**
 * Hero carousel content.
 *
 * Edit this file to replace, add, remove, or reorder hero images. The carousel
 * maps over this array, so no component changes are needed.
 *
 * Image files live in `public/images/hero/`. Use a local path such as
 * `/images/hero/my-image.webp`, or an absolute URL if the image is hosted
 * elsewhere. Reordering this array changes the order of the slides.
 */
export interface HeroSlide {
  id: string
  src: string
  alt: string
  title?: string
  description?: string
  badge?: string
  objectPosition?: string
  href?: string
}

export const heroSlides: HeroSlide[] = [
  {
    id: 'research-lab',
    src: '/images/hero/research-lab.webp',
    alt: 'Researcher using laboratory equipment in a shared campus lab',
    title: 'Research without barriers',
    description: 'Discover the equipment and facilities your next project needs.',
    badge: 'Research resources',
    objectPosition: 'center',
  },
  {
    id: 'scientific-equipment',
    src: '/images/hero/scientific-equipment.webp',
    alt: 'Scientific instruments arranged on a laboratory bench',
    title: 'Access the right equipment',
    description: 'Explore shared instruments maintained across campus.',
    badge: 'Shared facilities',
    objectPosition: 'center',
  },
  {
    id: 'collaborative-workspace',
    src: '/images/hero/collaborative-workspace.webp',
    alt: 'Students collaborating around a table in a campus workspace',
    title: 'Make ideas happen',
    description: 'Find the spaces and tools that move your work forward.',
    badge: 'Campus collaboration',
    objectPosition: 'center',
  },
]
