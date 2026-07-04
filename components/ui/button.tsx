'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

interface ButtonProps
  extends
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<any, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<
      Array<{ id: number; x: number; y: number; size: number }>
    >([])

    const handlePointerDown = (event: React.MouseEvent<any>) => {
      if (variant === 'link') return

      const button = event.currentTarget
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2

      const newRipple = {
        id: Date.now() + Math.random(),
        x,
        y,
        size,
      }

      setRipples((prev) => [...prev, newRipple])
    }

    const removeRipple = (id: number) => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }

    if (asChild) {
      const child = React.Children.only(props.children) as React.ReactElement<any>

      return React.cloneElement(
        child,
        {
          ref,
          className: cn(
            buttonVariants({ variant, size, className }),
            variant !== 'link' && 'relative overflow-hidden btn-shine',
            child.props.className
          ),
          onClick: (event: any) => {
            handlePointerDown(event)
            onClick?.(event)
            child.props.onClick?.(event)
          },
          ...props,
        },
        <>
          {child.props.children}
          {variant !== 'link' && (
            <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
              <AnimatePresence>
                {ripples.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    className="absolute rounded-full bg-current opacity-20 pointer-events-none"
                    initial={{ scale: 0, opacity: 0.35 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    onAnimationComplete={() => removeRipple(ripple.id)}
                    style={{
                      left: ripple.x,
                      top: ripple.y,
                      width: ripple.size,
                      height: ripple.size,
                    }}
                  />
                ))}
              </AnimatePresence>
            </span>
          )}
        </>
      )
    }

    return (
      <button
        suppressHydrationWarning
        className={cn(
          buttonVariants({ variant, size, className }),
          variant !== 'link' && 'relative overflow-hidden btn-shine'
        )}
        ref={ref}
        onClick={(event: any) => {
          handlePointerDown(event)
          onClick?.(event)
        }}
        {...props}
      >
        {props.children}
        {variant !== 'link' && (
          <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
            <AnimatePresence>
              {ripples.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  className="absolute rounded-full bg-current opacity-20 pointer-events-none"
                  initial={{ scale: 0, opacity: 0.35 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  onAnimationComplete={() => removeRipple(ripple.id)}
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    width: ripple.size,
                    height: ripple.size,
                  }}
                />
              ))}
            </AnimatePresence>
          </span>
        )}
      </button>
    )
  },
)
Button.displayName = 'Button'

export { Button }

