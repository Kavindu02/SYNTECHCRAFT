'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Twitter, Instagram, Linkedin, ArrowRight, Play, Settings } from 'lucide-react'

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden flex items-center pt-32 pb-16 lg:pt-20 lg:pb-0">
      {/* Background with Subtle Modern texture & Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-white z-10 opacity-70"></div>
        <img 
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070" 
          className="w-full h-full object-cover grayscale opacity-20"
          alt="Software Development"
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
              WE CODE <br />
              <span className="text-[#ffb400] not-italic">EXCELLENCE.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-slate-500 max-w-xl leading-relaxed font-medium"
            >
              SDK Solutions combines intuitive UI/UX design with high-performance web and enterprise engineering to build scalable digital products that transform businesses.
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
            <div className="relative z-10 aspect-[4/5] rounded-[40px] md:rounded-[60px] overflow-hidden border-[10px] md:border-[16px] border-white shadow-3xl bg-slate-100">
               <img 
                src="hero.jpg" 
                className="w-full h-full object-cover transition-all duration-1000" 
                alt="Code Representation" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Floating Info Box */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-4 md:-left-12 bottom-10 md:bottom-20 bg-white p-5 md:p-8 rounded-[25px] md:rounded-[30px] shadow-2xl border border-slate-50 z-20 hidden sm:flex items-center gap-3 md:gap-5"
            >
              <div className="w-10 h-10 md:w-14 md:h-14 bg-[#ffb400] rounded-xl md:rounded-2xl flex items-center justify-center text-black shadow-lg shadow-[#ffb400]/20">
                 <span className="font-black text-lg md:text-xl italic">1+</span>
              </div>
              <div>
                 <h4 className="text-slate-900 font-black text-base md:text-lg tracking-tighter">SDK SOLUTIONS</h4>
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

