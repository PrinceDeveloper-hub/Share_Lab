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
    id: 'scientific-equipment',
    src: '/images/hero/scientific-equipment.webp',
    alt: 'Researcher using laboratory equipment in a shared campus lab',
    title: 'Research without barriers',
    description:
      'Discover the equipment and facilities your next project needs.',
    badge: 'Research resources',
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
  {
    id: 'campus-research',
    src: '/images/hero/campus-research.jpg',
    alt: 'Glass beakers and pipettes prepared for a research experiment',
    title: 'Room to experiment',
    description:
      'Find shared lab equipment ready for your next research question.',
    badge: 'Open lab access',
    objectPosition: 'center',
  },
  {
    id: 'shared-laboratory',
    src: '/images/hero/shared-laboratory.jpg',
    alt: 'A pipette dispensing a sample into a laboratory plate',
    title: 'Tools for discovery',
    description:
      'Explore the specialist tools and facilities available across campus.',
    badge: 'Research in progress',
    objectPosition: 'center',
  },
]
