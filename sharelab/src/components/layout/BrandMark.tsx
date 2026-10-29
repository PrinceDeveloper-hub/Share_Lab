import { useEffect, useRef, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BrandMarkProps {
  className?: string
  imageClassName?: string
  iconClassName?: string
}

/**
 * Uses the supplied ShareLab logo at /images/logo. Until that asset is a
 * readable image the flask mark is shown, so the header never renders a
 * broken-image icon.
 */
export const BrandMark = ({
  className,
  imageClassName,
  iconClassName,
}: BrandMarkProps) => {
  const [failed, setFailed] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const image = imageRef.current
    if (image?.complete && image.naturalWidth === 0) setFailed(true)
  }, [])

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden',
        className,
      )}
    >
      {failed ? (
        <FlaskConical
          className={cn('h-[1.05rem] w-[1.05rem]', iconClassName)}
          aria-hidden="true"
        />
      ) : (
        <img
          ref={imageRef}
          src="/images/logo"
          alt=""
          aria-hidden="true"
          className={cn('h-full w-full object-contain', imageClassName)}
          onError={() => setFailed(true)}
          decoding="async"
        />
      )}
    </span>
  )
}

export default BrandMark
