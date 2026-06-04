'use client'

import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  char: string
  opacity: number
  size: number
  angle: number
  spin: number
  color: string
}

export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [visible,  setVisible]  = useState(false)
  const [hovering, setHovering] = useState(false)
  const [clicking, setClicking] = useState(false)

  useEffect(() => {
    // Touch device → bail out, keep native cursor, do not show custom elements
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    // Hide the native cursor site-wide on desktop
    const style = document.createElement('style')
    style.id = 'custom-cursor-hide'
    style.textContent = '*, *::before, *::after { cursor: none !important; }'
    document.head.appendChild(style)

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let mouseX = 0
    let mouseY = 0
    let ringX  = 0
    let ringY  = 0
    let lastX  = 0
    let lastY  = 0
    let rafId  = 0

    const SYMBOLS = ['{', '}', '</>', '[]', '()', '=>', ';', '<>', 'const', 'fn', 'let', '++']
    // A curated, harmonious, techy color palette with our gold brand color as primary
    const COLORS = [
      '#ffb400', // Syntechcraft gold
      '#ffd254', // Light gold
      '#ff9d00', // Darker gold
      '#00f0ff', // Techy neon cyan
      '#a855f7', // Techy purple
    ]

    const particles: Particle[] = []

    // Dot snaps instantly; ring lerps smoothly behind; particles animate on canvas
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

      // Draw and update particles on canvas
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.vx
          p.y += p.vy
          p.angle += p.spin
          p.opacity -= 0.016 // fade out rate (approx. 1 second lifetime)
          p.size -= 0.02 // shrink slowly

          if (p.opacity <= 0 || p.size <= 0) {
            particles.splice(i, 1)
            continue
          }

          ctx.save()
          ctx.globalAlpha = p.opacity
          ctx.translate(p.x, p.y)
          ctx.rotate(p.angle)
          
          // Glow effect for that high-end, premium feel
          ctx.shadowBlur = 4
          ctx.shadowColor = p.color
          ctx.fillStyle = p.color
          
          // Use monospace font variables if available
          ctx.font = `bold ${p.size}px var(--font-geist-mono), monospace`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(p.char, 0, 0)
          ctx.restore()
        }
      }

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    const onMove = (e: MouseEvent) => {
      const x = e.clientX
      const y = e.clientY

      if (lastX === 0 && lastY === 0) {
        lastX = x
        lastY = y
      }

      mouseX = x
      mouseY = y
      setVisible(true)

      const dx = x - lastX
      const dy = y - lastY
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Spawn particles when mouse is dragged/moved past a threshold
      if (dist > 12) {
        const count = Math.min(Math.floor(dist / 12), 3)
        for (let i = 0; i < count; i++) {
          const t = i / count
          const spawnX = lastX + dx * t
          const spawnY = lastY + dy * t

          // Playful outward physics: particles drift slightly upwards and push outwards
          const angle = Math.random() * Math.PI * 2
          const speed = Math.random() * 0.8 + 0.3

          particles.push({
            x: spawnX,
            y: spawnY,
            vx: Math.cos(angle) * speed * 0.4,
            vy: -Math.random() * 0.8 - 0.2, // Floats upward
            char: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            opacity: 1.0,
            size: Math.random() * 5 + 10, // 10px to 15px
            angle: (Math.random() - 0.5) * 0.5,
            spin: (Math.random() - 0.5) * 0.04,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          })
        }
        lastX = x
        lastY = y
      }
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

    // Hover detection — use event delegation to avoid mutating DOM attributes and causing hydration mismatches
    const SELECTORS = 'a, button, [role="button"], input, textarea, select, label, [data-cursor-hover]'

    const handleMouseOver = (e: MouseEvent) => {
      if (e.target instanceof Element) {
        setHovering(!!e.target.closest(SELECTORS))
      }
    }

    document.addEventListener('mouseover', handleMouseOver)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resizeCanvas)
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mousedown',  onDown)
      document.removeEventListener('mouseup',    onUp)
      document.removeEventListener('mouseover',  handleMouseOver)
      document.getElementById('custom-cursor-hide')?.remove()
    }
  }, [])

  return (
    <>
      {/* ── Particle Trail Canvas ── */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[99997] hidden md:block"
      />

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
