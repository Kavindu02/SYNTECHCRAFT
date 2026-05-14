'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // Show earlier on desktop (300px), but later on mobile (500px) to stay out of initial view/navbar
      const threshold = window.innerWidth < 768 ? 500 : 300
      if (window.scrollY > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="fixed bottom-6 right-6 md:bottom-4 md:right-8 z-[90]"
        >
          <div className="relative">
            {/* Ripple Effects */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-[#ffb400] rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute inset-0 bg-[#ffb400] rounded-full"
            />
            
            <button
              onClick={scrollToTop}
              className="relative w-12 h-12 md:w-14 md:h-14 bg-black border border-white/10 rounded-full flex items-center justify-center text-[#ffb400] shadow-2xl hover:bg-[#ffb400] hover:text-black hover:scale-110 transition-all duration-300 group"
              aria-label="Scroll to top"
            >
              <ArrowUp size={20} className="md:size-6 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
