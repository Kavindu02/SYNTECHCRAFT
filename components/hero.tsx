'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Twitter, Instagram, Linkedin, ArrowRight, Play, Settings } from 'lucide-react'

const Hero = () => {
  const [hoveredHeadlinePart, setHoveredHeadlinePart] = useState<'we-code' | 'excellence' | null>(null)

  const innerBubbles = [
    {
      size: 'w-4 h-4 md:w-6 md:h-6',
      color: 'bg-[#ffb400]/90',
      glow: 'shadow-[0_0_24px_rgba(255,180,0,0.45)]',
      leftPath: ['12%', '76%', '55%', '18%', '12%'],
      topPath: ['18%', '10%', '48%', '72%', '18%'],
      duration: 10,
      delay: 0,
    },
    {
      size: 'w-3 h-3 md:w-5 md:h-5',
      color: 'bg-black/85',
      glow: 'shadow-[0_0_20px_rgba(0,0,0,0.35)]',
      leftPath: ['84%', '60%', '28%', '72%', '84%'],
      topPath: ['26%', '62%', '44%', '14%', '26%'],
      duration: 9,
      delay: 0.5,
    },
    {
      size: 'w-5 h-5 md:w-7 md:h-7',
      color: 'bg-[#ffb400]/80',
      glow: 'shadow-[0_0_28px_rgba(255,180,0,0.4)]',
      leftPath: ['20%', '46%', '78%', '38%', '20%'],
      topPath: ['82%', '52%', '70%', '28%', '82%'],
      duration: 11,
      delay: 0.2,
    },
    {
      size: 'w-4 h-4 md:w-6 md:h-6',
      color: 'bg-black/80',
      glow: 'shadow-[0_0_24px_rgba(0,0,0,0.3)]',
      leftPath: ['72%', '34%', '14%', '58%', '72%'],
      topPath: ['86%', '60%', '24%', '42%', '86%'],
      duration: 10.5,
      delay: 0.8,
    },
    {
      size: 'w-2 h-2 md:w-3 md:h-3',
      color: 'bg-[#ffb400]/75',
      glow: 'shadow-[0_0_14px_rgba(255,180,0,0.35)]',
      leftPath: ['30%', '64%', '50%', '22%', '30%'],
      topPath: ['34%', '22%', '66%', '58%', '34%'],
      duration: 8.5,
      delay: 0.3,
    },
    {
      size: 'w-2 h-2 md:w-3 md:h-3',
      color: 'bg-black/75',
      glow: 'shadow-[0_0_14px_rgba(0,0,0,0.3)]',
      leftPath: ['68%', '40%', '18%', '52%', '68%'],
      topPath: ['40%', '74%', '56%', '18%', '40%'],
      duration: 9.5,
      delay: 1,
    },
    {
      size: 'w-3 h-3 md:w-4 md:h-4',
      color: 'bg-[#ffb400]/70',
      glow: 'shadow-[0_0_16px_rgba(255,180,0,0.3)]',
      leftPath: ['14%', '36%', '70%', '48%', '14%'],
      topPath: ['60%', '82%', '54%', '26%', '60%'],
      duration: 12,
      delay: 0.6,
    },
  ]

  const outerBubbles = [
    {
      size: 'w-2 h-2 md:w-3 md:h-3',
      color: 'bg-[#ffb400]/80',
      glow: 'shadow-[0_0_12px_rgba(255,180,0,0.3)]',
      leftPath: ['8%', '92%', '92%', '8%', '8%'],
      topPath: ['-2%', '-2%', '102%', '102%', '-2%'],
      duration: 15,
      delay: 0,
    },
    {
      size: 'w-2 h-2 md:w-3 md:h-3',
      color: 'bg-black/75',
      glow: 'shadow-[0_0_12px_rgba(0,0,0,0.28)]',
      leftPath: ['92%', '92%', '8%', '8%', '92%'],
      topPath: ['10%', '96%', '96%', '10%', '10%'],
      duration: 16,
      delay: 0.9,
    },
    {
      size: 'w-2 h-2 md:w-3 md:h-3',
      color: 'bg-black/70',
      glow: 'shadow-[0_0_10px_rgba(0,0,0,0.24)]',
      leftPath: ['68%', '4%', '20%', '94%', '68%'],
      topPath: ['96%', '74%', '4%', '24%', '96%'],
      duration: 15,
      delay: 1.1,
    },
  ]

  const burstBubbles = [
    {
      size: 'w-2 h-2 md:w-3 md:h-3',
      color: 'bg-[#ffb400]/80',
      glow: 'shadow-[0_0_12px_rgba(255,180,0,0.35)]',
      startLeft: '48%',
      startTop: '58%',
      xPath: [0, 30, 80, 130],
      yPath: [0, -20, -70, -120],
      duration: 4.8,
      delay: 0.2,
    },
    {
      size: 'w-2 h-2 md:w-3 md:h-3',
      color: 'bg-black/75',
      glow: 'shadow-[0_0_12px_rgba(0,0,0,0.28)]',
      startLeft: '54%',
      startTop: '62%',
      xPath: [0, -24, -72, -120],
      yPath: [0, -16, -62, -110],
      duration: 5.2,
      delay: 1.1,
    },
    {
      size: 'w-2 h-2 md:w-3 md:h-3',
      color: 'bg-[#ffb400]/75',
      glow: 'shadow-[0_0_12px_rgba(255,180,0,0.32)]',
      startLeft: '42%',
      startTop: '52%',
      xPath: [0, 22, 66, 104],
      yPath: [0, 18, 64, 108],
      duration: 5,
      delay: 2,
    },
  ]

  return (
    <section className="relative min-h-screen overflow-hidden flex items-center pt-24 pb-8 lg:pt-20 lg:pb-0">
      {/* Background with Subtle Modern texture & Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-white z-10 opacity-70"></div>
        <motion.img 
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070" 
          className="w-full h-full object-cover grayscale opacity-20"
          alt="Software Development"
          animate={{
            scale: [1, 1.05, 1.02, 1],
            x: [0, 16, -10, 0],
            y: [0, -12, 8, 0],
            rotate: [0, 0.25, -0.2, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Modern Shapes */}
        <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#ffb400]/10 rounded-full blur-[80px] md:blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-black/5 rounded-full blur-[70px] md:blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-6 sm:px-12 lg:px-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="w-full lg:w-3/5 flex flex-col items-start gap-8 lg:gap-10">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 md:w-12 h-[2px] bg-[#ffb400]"></div>
              <span className="text-[#ffb400] font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px]">NEXT-GEN SOFTWARE SOLUTIONS</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-slate-900 leading-[0.85] md:leading-[0.8] tracking-tighter uppercase italic"
            >
              <span
                onMouseEnter={() => setHoveredHeadlinePart('we-code')}
                onMouseLeave={() => setHoveredHeadlinePart(null)}
                className={`inline-block cursor-pointer transition-colors duration-300 ${
                  hoveredHeadlinePart ? 'text-[#ffb400]' : 'text-slate-900'
                }`}
              >
                WE CODE
              </span>{' '}
              <br />
              <span
                onMouseEnter={() => setHoveredHeadlinePart('excellence')}
                onMouseLeave={() => setHoveredHeadlinePart(null)}
                className={`inline-block cursor-pointer not-italic transition-colors duration-300 ${
                  hoveredHeadlinePart ? 'text-black' : 'text-[#ffb400]'
                }`}
              >
                EXCELLENCE.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-slate-500 max-w-xl leading-relaxed font-medium"
            >
              SYNTECHCRAFT combines intuitive UI/UX design with high-performance web and enterprise engineering to build scalable digital products that transform businesses.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-8"
            >
              <motion.a 
                href="#portfolio" 
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255, 180, 0, 0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-black text-white px-8 py-5 md:px-12 md:py-7 rounded-2xl font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px] hover:bg-[#ffb400] hover:text-black transition-all flex items-center gap-4 group cursor-pointer text-center relative overflow-hidden"
              >
                <span className="relative z-10">VIEW PROJECTS</span>
                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                
                {/* Animated Background Shimmer */}
                <motion.div 
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"
                />
              </motion.a>
            </motion.div>
          </div>

          {/* Right Content - Profile/Image with modern frame */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1 }}
             className="w-full lg:w-2/5 relative"
          >
            <div className="absolute inset-0 pointer-events-none z-20">
              {outerBubbles.map((bubble, index) => (
                <motion.div
                  key={`outer-bubble-${index}`}
                  animate={{
                    left: bubble.leftPath,
                    top: bubble.topPath,
                    scale: [1, 1.06, 0.96, 1],
                  }}
                  transition={{
                    duration: bubble.duration + 2,
                    delay: bubble.delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className={`absolute ${bubble.size} ${bubble.color} ${bubble.glow} rounded-full`}
                  style={{ left: bubble.leftPath[0], top: bubble.topPath[0] }}
                />
              ))}
            </div>

            <div className="absolute inset-0 pointer-events-none z-30">
              {burstBubbles.map((bubble, index) => (
                <motion.div
                  key={`burst-bubble-${index}`}
                  animate={{
                    x: bubble.xPath,
                    y: bubble.yPath,
                    opacity: [0, 0.95, 0.6, 0],
                    scale: [0.85, 1.02, 0.95, 0.8],
                  }}
                  transition={{
                    duration: bubble.duration,
                    delay: bubble.delay,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  className={`absolute ${bubble.size} ${bubble.color} ${bubble.glow} rounded-full`}
                  style={{ left: bubble.startLeft, top: bubble.startTop }}
                />
              ))}
            </div>

            <div className="relative z-10 aspect-[4/5] rounded-[40px] md:rounded-[60px] overflow-hidden border-[10px] md:border-[16px] border-white shadow-3xl bg-slate-100 group">
               <motion.img 
                src="https://res.cloudinary.com/dz0hl3qmz/image/upload/v1773734891/man-is-working-computer-with-computer-screen-that-says-time_1_ttudsy.jpg" 
                className="w-full h-full object-cover" 
                alt="Code Representation" 
                loading="lazy"
                animate={{
                  scale: [1, 1.04, 1],
                  x: [0, 8, 0],
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 14,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
               <div className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-22deg] translate-x-[-180%] group-hover:translate-x-[520%] transition-transform duration-1200 ease-out"></div>
               <div className="absolute inset-0 pointer-events-none z-20">
                 {innerBubbles.map((bubble, index) => (
                   <motion.div
                     key={`inner-bubble-${index}`}
                     animate={{
                       left: bubble.leftPath,
                       top: bubble.topPath,
                       scale: [1, 1.06, 0.96, 1],
                     }}
                     transition={{
                       duration: bubble.duration + 1.5,
                       delay: bubble.delay,
                       repeat: Infinity,
                       ease: 'easeInOut',
                     }}
                     className={`absolute ${bubble.size} ${bubble.color} ${bubble.glow} rounded-full`}
                     style={{ left: bubble.leftPath[0], top: bubble.topPath[0] }}
                   />
                 ))}
               </div>
            </div>

            {/* Floating Info Box */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-4 md:-left-12 bottom-10 md:bottom-20 bg-white p-5 md:p-8 rounded-[25px] md:rounded-[30px] shadow-2xl border border-slate-50 z-20 hidden sm:flex items-center gap-3 md:gap-5"
            >
              <div className="w-10 h-10 md:w-14 md:h-14 bg-[#ffb400] rounded-xl md:rounded-2xl flex items-center justify-center text-black shadow-lg shadow-[#ffb400]/20">
                 <span className="font-black text-lg md:text-xl italic">2+</span>
              </div>
              <div>
                 <h4 className="text-slate-900 font-black text-base md:text-lg tracking-tighter">SYNTECHCRAFT</h4>
                 <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#ffb400]">Dev Excellence</p>
              </div>
            </motion.div>

            {/* Background Decorative Frame */}
            <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 w-full h-full border-[2px] md:border-[3px] border-dashed border-[#ffb400]/30 rounded-[40px] md:rounded-[60px] -z-10 translate-x-4 translate-y-4"></div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero

