import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './button'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = Boolean(useReducedMotion())

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    window.requestAnimationFrame(() => panelRef.current?.focus())

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, open])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(43,29,20,0.44)] p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby={description ? 'modal-description' : undefined}
            tabIndex={-1}
            initial={
              shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.99 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 12, scale: 0.99 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
              'flex max-h-[calc(100dvh-1rem)] w-full flex-col rounded-t-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--cream)] shadow-[var(--shadow-lg)] outline-none sm:max-h-[calc(100dvh-3rem)] sm:rounded-[var(--radius-xl)]',
              sizeStyles[size],
              className,
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-5 py-4">
              <div>
                <h2
                  id="modal-title"
                  className="text-base font-semibold text-[var(--charcoal)]"
                >
                  {title}
                </h2>
                {description ? (
                  <div
                    id="modal-description"
                    className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--muted)]"
                  >
                    {description}
                  </div>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            {children ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                {children}
              </div>
            ) : null}

            {footer ? (
              <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border-subtle)] px-5 py-4">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  loading?: boolean
}

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  loading,
}: ConfirmDialogProps) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    description={description}
    size="sm"
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={tone === 'danger' ? 'danger' : 'default'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Working…' : confirmLabel}
        </Button>
      </>
    }
  />
)

export default Modal
