'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Projects', href: '#portfolio' },
  ]

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'py-4 bg-white/90 backdrop-blur-xl shadow-lg border-b border-slate-100' : 'py-8 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="#home" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 group-hover:scale-110 transition-transform">
            <Image 
              src="/sdklogo.png" 
              alt="SDK Solutions Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">
            SDK <span className="text-[#ffb400] not-italic">Solutions</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="relative text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-black transition-colors group"
            >
              {link.name}
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-[#ffb400] transition-all group-hover:w-full"></span>
            </Link>
          ))}
          <a 
            href="#contact" 
            className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#ffb400] hover:text-black transition-all shadow-xl shadow-black/10 hover:shadow-[#ffb400]/20 flex items-center gap-3"
          >
            Contact
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 hover:bg-[#ffb400] transition-all"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-50 shadow-2xl lg:hidden p-12 flex flex-col"
          >
            <div className="flex justify-between items-center mb-20">
              <span className="text-xl font-black text-slate-900 italic uppercase">SDK</span>
              <button 
                className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center"
                onClick={() => setIsOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-8 mb-auto">
              {navLinks.map((link, idx) => (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  key={link.name}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic hover:text-[#ffb400] transition-colors block"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-10">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">Connect with us</p>
              <div className="flex gap-4 mb-10">
                {['TW', 'IG', 'LN'].map((s) => (
                  <div key={s} className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-[10px] tracking-widest hover:bg-[#ffb400] transition-all cursor-pointer">
                    {s}
                  </div>
                ))}
              </div>
              <a 
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="w-full bg-[#ffb400] text-black font-black py-6 rounded-2xl text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4"
              >
                Let&apos;s Talk <ArrowRight size={18} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
