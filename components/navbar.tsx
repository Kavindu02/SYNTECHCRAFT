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
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
        scrolled ? 'py-4 bg-white shadow-xl border-b border-slate-100' : 'py-6 md:py-8 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="#home" className="flex items-center gap-2 md:gap-3 group">
          <div className="relative w-10 h-10 md:w-12 md:h-12 group-hover:scale-110 transition-transform">
            <Image 
              src="/sdklogo.png" 
              alt="SDK Solutions Logo" 
              fill 
              sizes="(max-width: 768px) 40px, 48px"
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter italic uppercase">
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
          className="lg:hidden w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 hover:bg-[#ffb400] transition-all"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} className="md:size-6" /> : <Menu size={20} className="md:size-6" />}
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] lg:hidden"
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
            className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-[120] shadow-2xl lg:hidden p-12 flex flex-col"
          >
            <div className="flex justify-between items-center mb-16">
              <Link href="#home" onClick={() => setIsOpen(false)} className="flex items-center gap-2 group">
                <div className="relative w-10 h-10">
                  <Image 
                    src="/sdklogo.png" 
                    alt="SDK Solutions Logo" 
                    fill 
                    sizes="40px"
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tighter italic uppercase">
                  SDK <span className="text-[#ffb400] not-italic">Solutions</span>
                </span>
              </Link>
              <button 
                className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-[#ffb400] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-6 mb-auto">
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
                {[
                  { 
                    icon: (props: any) => (
                      <svg {...props} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24 l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                      </svg>
                    ), 
                    href: 'https://www.facebook.com/share/17hZxJtcym/?mibextid=wwXIfr', 
                    label: 'Facebook' 
                  },
                  { 
                    icon: (props: any) => (
                      <svg {...props} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                      </svg>
                    ), 
                    href: 'https://www.tiktok.com/@sdk.solutions?_r=1&_t=ZS-9406SF07AjR', 
                    label: 'TikTok' 
                  },
                  { 
                    icon: (props: any) => (
                      <svg {...props} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0zM7.12 19H3.85V8.11h3.27V19zM5.485 6.742c-1.05 0-1.897-.852-1.897-1.9s.847-1.9 1.897-1.9c1.048 0 1.895.852 1.895 1.9s-.847 1.9-1.895 1.9zM19 19h-3.27v-5.12c0-1.222-.022-2.795-1.703-2.795-1.705 0-1.966 1.332-1.966 2.707V19h-3.27V8.11h3.14v1.49h.044c.438-.83 1.508-1.706 3.107-1.706 3.322 0 3.935 2.187 3.935 5.03V19z" />
                      </svg>
                    ), 
                    href: 'https://www.linkedin.com/company/sdk-solutions01/posts/?feedView=all', 
                    label: 'LinkedIn' 
                  }
                ].map((social, idx) => (
                  <a 
                    key={idx} 
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black hover:bg-[#ffb400] hover:border-[#ffb400] transition-all duration-300 group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
              <a 
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="w-full bg-[#ffb400] text-black font-black py-6 rounded-2xl text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black hover:text-white transition-all shadow-lg"
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
