'use client'

import { useEffect } from 'react'

type HeroCodeBackgroundProps = {
  tone?: 'light' | 'dark'
}

const lightParticlesConfig = {
  particles: {
    number: {
      value: 46,
      density: {
        enable: true,
        value_area: 900,
      },
    },
    color: {
      value: '#111827',
    },
    shape: {
      type: 'circle',
    },
    opacity: {
      value: 0.14,
      random: true,
      anim: {
        enable: true,
        speed: 0.35,
        opacity_min: 0.05,
        sync: false,
      },
    },
    size: {
      value: 2.2,
      random: true,
      anim: {
        enable: true,
        speed: 0.45,
        size_min: 0.6,
        sync: false,
      },
    },
    line_linked: {
      enable: true,
      distance: 160,
      color: '#111827',
      opacity: 0.08,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.35,
      direction: 'none',
      random: true,
      straight: false,
      out_mode: 'out',
      bounce: false,
    },
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: {
        enable: false,
      },
      onclick: {
        enable: false,
      },
      resize: true,
    },
  },
  retina_detect: true,
}

const darkParticlesConfig = {
  particles: {
    number: {
      value: 38,
      density: {
        enable: true,
        value_area: 900,
      },
    },
    color: {
      value: ['#f8fafc', '#ffb400'],
    },
    shape: {
      type: 'circle',
    },
    opacity: {
      value: 0.18,
      random: true,
      anim: {
        enable: true,
        speed: 0.35,
        opacity_min: 0.06,
        sync: false,
      },
    },
    size: {
      value: 2.1,
      random: true,
      anim: {
        enable: true,
        speed: 0.4,
        size_min: 0.6,
        sync: false,
      },
    },
    line_linked: {
      enable: true,
      distance: 180,
      color: '#f8fafc',
      opacity: 0.12,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.3,
      direction: 'none',
      random: true,
      straight: false,
      out_mode: 'out',
      bounce: false,
    },
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: {
        enable: false,
      },
      onclick: {
        enable: false,
      },
      resize: true,
    },
  },
  retina_detect: true,
}

function destroyParticles() {
  if (!window.pJSDom?.length) return

  window.pJSDom = window.pJSDom.filter((entry) => {
    const parentId = (entry?.pJS?.canvas?.el?.parentNode as HTMLElement | null)?.id
    if (parentId === 'hero-particles') {
      entry?.pJS?.fn?.vendors?.destroypJS?.()
      return false
    }
    return true
  })
}

export function HeroCodeBackground({ tone = 'light' }: HeroCodeBackgroundProps) {
  const particlesConfig = tone === 'dark' ? darkParticlesConfig : lightParticlesConfig
  const overlayClass =
    tone === 'dark'
      ? 'absolute inset-0 bg-gradient-to-br from-black/35 via-black/15 to-transparent'
      : 'absolute inset-0 bg-gradient-to-br from-white/30 via-white/15 to-white/5'
  const accentTopLeftClass =
    tone === 'dark'
      ? 'absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,180,0,0.18),transparent_55%)]'
      : 'absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,180,0,0.14),transparent_55%)]'
  const accentBottomRightClass =
    tone === 'dark'
      ? 'absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(248,250,252,0.12),transparent_50%)]'
      : 'absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.08),transparent_50%)]'

  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let isActive = true

    const initParticles = async () => {
      await import('particles.js')
      if (!isActive || !window.particlesJS) return
      destroyParticles()
      window.particlesJS('hero-particles', particlesConfig)
    }

    initParticles()

    return () => {
      isActive = false
      destroyParticles()
    }
  }, [particlesConfig])

  return (
    <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
      <div id="hero-particles" className="absolute inset-0" />
      <div className={overlayClass} />
      <div className={accentTopLeftClass} />
      <div className={accentBottomRightClass} />
    </div>
  )
}
