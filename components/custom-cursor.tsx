'use client'

import { useEffect, useRef, useState } from 'react'

export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  const [visible,  setVisible]  = useState(false)
  const [hovering, setHovering] = useState(false)
  const [clicking, setClicking] = useState(false)

  useEffect(() => {
    // Touch device → bail out, keep native cursor
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    // Hide the native cursor site-wide
    const style = document.createElement('style')
    style.id = 'custom-cursor-hide'
    style.textContent = '*, *::before, *::after { cursor: none !important; }'
    document.head.appendChild(style)

    let mouseX = 0
    let mouseY = 0
    let ringX  = 0
    let ringY  = 0
    let rafId  = 0

    // Dot snaps instantly; ring lerps smoothly behind
    const tick = () => {
      ringX += (mouseX - ringX) * 0.1
      ringY += (mouseY - ringY) * 0.1

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(calc(-50% + ${mouseX}px), calc(-50% + ${mouseY}px))`
      }
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(calc(-50% + ${ringX}px), calc(-50% + ${ringY}px))`
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      setVisible(true)
    }
    const onLeave  = () => setVisible(false)
    const onEnter  = () => setVisible(true)
    const onDown   = () => setClicking(true)
    const onUp     = () => setClicking(false)

    document.addEventListener('mousemove',  onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mousedown',  onDown)
    document.addEventListener('mouseup',    onUp)

    // Hover detection — attach/re-attach on DOM mutations
    const SELECTORS = 'a, button, [role="button"], input, textarea, select, label, [data-cursor-hover]'

    const attachHover = () => {
      document.querySelectorAll<HTMLElement>(SELECTORS).forEach(el => {
        if (el.dataset.cursorBound) return
        el.dataset.cursorBound = '1'
        el.addEventListener('mouseenter', () => setHovering(true))
        el.addEventListener('mouseleave', () => setHovering(false))
      })
    }
    attachHover()

    const mo = new MutationObserver(attachHover)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mousedown',  onDown)
      document.removeEventListener('mouseup',    onUp)
      mo.disconnect()
      document.getElementById('custom-cursor-hide')?.remove()
    }
  }, [])

  return (
    <>
      {/* ── Dot ── snaps to cursor instantly */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[99999] hidden md:block"
        style={{
          width:  hovering ? '10px' : clicking ? '6px' : '8px',
          height: hovering ? '10px' : clicking ? '6px' : '8px',
          borderRadius: '50%',
          backgroundColor: '#ffb400',
          opacity: visible ? 1 : 0,
          transition: 'width 0.2s ease, height 0.2s ease, opacity 0.3s ease, box-shadow 0.2s ease',
          boxShadow: hovering
            ? '0 0 16px 4px rgba(255,180,0,0.7)'
            : clicking
            ? '0 0 8px 2px rgba(255,180,0,0.9)'
            : '0 0 6px 1px rgba(255,180,0,0.5)',
          willChange: 'transform',
        }}
      />

      {/* ── Ring ── lags behind, expands on hover */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[99998] hidden md:block"
        style={{
          width:  hovering ? '52px' : clicking ? '28px' : '36px',
          height: hovering ? '52px' : clicking ? '28px' : '36px',
          borderRadius: '50%',
          border: `1.5px solid rgba(255,180,0,${hovering ? 0.75 : 0.45})`,
          backgroundColor: hovering
            ? 'rgba(255,180,0,0.08)'
            : 'transparent',
          opacity: visible ? 1 : 0,
          transition:
            'width 0.35s cubic-bezier(0.23,1,0.32,1), ' +
            'height 0.35s cubic-bezier(0.23,1,0.32,1), ' +
            'border-color 0.3s ease, ' +
            'background-color 0.3s ease, ' +
            'opacity 0.3s ease',
          willChange: 'transform',
          backdropFilter: hovering ? 'blur(1px)' : 'none',
        }}
      />
    </>
  )
}
