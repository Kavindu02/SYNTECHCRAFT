'use client'

import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import Image from 'next/image'
import { ContactForm } from '@/components/contact-form'
import { motion, useInView, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, BarChart3, PieChart, TrendingUp, Users, Briefcase, Globe, ArrowRight, MapPin, Phone, Mail, Rocket, Zap, Award, ArrowUpRight, Smartphone, Facebook, Linkedin, ArrowUp } from 'lucide-react'

// Languages/Tech Stack Data
const languages = [
  { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
  { name: 'Next.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg' },
  { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
  { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg' },
  { name: 'Tailwind', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg' },
  { name: 'MongoDB', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg' },
  { name: 'Express', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg' },
  { name: 'MySQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg' },
  { name: 'Firebase', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg' },
  { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
  { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
]

const serviceList = [
  { title: 'Web Development', desc: 'Custom web applications built with modern technologies.', icon: Globe },
  { title: 'Mobile Apps', desc: 'Native and cross-platform mobile solutions.', icon: Smartphone },
  { title: 'UI/UX Design', desc: 'Pixel-perfect designs that engage users.', icon: BarChart3 },
  { title: 'Cloud Solutions', desc: 'Scalable cloud architecture and deployment.', icon: Rocket },
  { title: 'API Development', desc: 'Robust and secure REST & GraphQL APIs.', icon: Zap },
  { title: 'DevOps', desc: 'CI/CD pipelines and infrastructure automation.', icon: Award },
]

// Counter Component with Scroll-Triggered Animation
function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.5 }) // Animates when 50% visible

  useEffect(() => {
    if (!inView) {
      setDisplayValue(0)
      return
    }
    
    let start = 0
    const end = value
    const duration = 1500
    const startTime = Date.now()

    const timer = setInterval(() => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      const easeOutQuad = progress * (2 - progress) // Smooth easing
      const current = Math.floor(easeOutQuad * end)
      setDisplayValue(current)
      
      if (progress === 1) clearInterval(timer)
    }, 16)

    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <motion.span 
      ref={ref}
      initial={{ y: 40, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
      transition={{ duration: 0.8, ease: "circOut" }}
      className="inline-block"
    >
      {displayValue}{suffix}
    </motion.span>
  )
}

export default function Home() {
  const [projectsList, setProjectsList] = useState<any[]>([])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects')
        const data = await res.json()
        setProjectsList(data)
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      }
    }
    fetchProjects()
  }, [])

  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // Independent floating motions for each stat card
  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60])
  const y2 = useTransform(scrollYProgress, [0, 1], [30, -30])
  const y3 = useTransform(scrollYProgress, [0, 1], [90, -90])

  return (
    <main className="min-h-screen bg-[#FAF9F6] scroll-smooth selection:bg-[#ffb400] selection:text-black">
      <Navbar />
      
      {/* Hero Section */}
      <div id="home">
        <Hero />
      </div>

      {/* Trusted By / Logo Cloud - TRULY MODERN ADDITION */}
      <section className="py-32 border-b border-slate-100 bg-[#FAF9F6] overflow-hidden relative">
        {/* Decorative background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(#ffb400_0.5px,transparent_1px)] [background-size:32px_32px] opacity-[0.15]"></div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white z-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-0">
          <div className="flex flex-col items-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="h-px w-8 bg-[#ffb400]"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#ffb400]">Tech Stack</p>
              <div className="h-px w-8 bg-[#ffb400]"></div>
            </motion.div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">TECHNOLOGIES WE MASTER</h2>
          </div>

          <div className="relative flex overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap gap-8 md:gap-12 py-8">
              {[...languages, ...languages].map((lang, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ y: -5 }}
                  className="flex items-center gap-5 px-8 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-[#ffb400]/30 hover:shadow-xl hover:shadow-[#ffb400]/5 transition-all duration-500 cursor-default"
                >
                  <div className="w-10 h-10 flex items-center justify-center transition-all duration-700">
                    <img src={lang.icon} alt={lang.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">{lang.name}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Ready</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section - ENHANCED MODERN */}
      <section id="about" className="py-40 px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-32 items-center relative">
        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#ffb400]/5 blur-[120px] rounded-full"></div>
        
        <div className="relative order-2 lg:order-1">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full aspect-[4/5] bg-slate-200 rounded-[60px] overflow-hidden border-[15px] border-white shadow-3xl relative z-10 group"
          >
             <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt="SDK Team" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
             <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[60px]"></div>
          </motion.div>
          
          {/* Floating Experience Card */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-12 -right-12 bg-[#ffb400] p-12 rounded-[40px] shadow-2xl z-20 hidden md:block rotate-3"
          >
             <span className="block text-8xl font-black text-black tracking-tighter italic leading-none">1+</span>
             <span className="block text-black font-black uppercase tracking-[0.2em] text-[10px] mt-4">Years Pioneering <br/>Digital Frontiers</span>
          </motion.div>
          
          <div className="absolute -bottom-10 -left-10 w-full h-full border-[3px] border-dashed border-slate-200 rounded-[60px] -z-0"></div>
        </div>

        <div className="flex flex-col gap-12 order-1 lg:order-2">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-[2px] bg-[#ffb400]"></div>
              <span className="text-[#ffb400] font-black uppercase tracking-[0.5em] text-[10px]">The SDK Standard</span>
            </div>
            <h2 className="text-6xl lg:text-8xl font-black leading-[0.8] text-slate-900 tracking-tighter uppercase italic">
              WE TRANSFORM <br /><span className="text-[#ffb400] not-italic">REALITY.</span>
            </h2>
          </div>
          
          <p className="text-slate-500 leading-relaxed text-xl font-medium max-w-xl">
             SDK Solutions isn&apos;t just a dev house. We are architects of the digital future, blending logic with aesthetics to build software that defines industries.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
            {[
              { t: 'Modern Stack', d: 'React, Next.js, Node.js' },
              { t: 'Pure Design', d: 'Pixel-perfect UI/UX' },
              { t: 'Secure Core', d: 'Enterprise-grade safety' },
              { t: 'Fast Scale', d: 'High performance code' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-3 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#ffb400] transition-all">
                    <CheckCircle2 size={20} className="text-[#ffb400] group-hover:text-black" />
                  </div>
                  <h4 className="font-black text-[12px] uppercase tracking-widest text-slate-900">{item.t}</h4>
                </div>
                <p className="text-slate-400 text-xs font-medium pl-14">{item.d}</p>
              </div>
            ))}
          </div>

          <div className="pt-8">
            <a href="#services" className="inline-flex items-center gap-6 bg-black text-white px-10 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#ffb400] hover:text-black transition-all shadow-3xl shadow-black/10 group">
              Discover Our Edge
              <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* TRULY MODERN Stats Section - Clean & Typographic */}
      <section ref={containerRef} className="relative py-20 overflow-hidden bg-[#0a0a0a]">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070" 
            className="w-full h-full object-cover opacity-25 scale-110 grayscale-[0.5]"
            alt="Advanced Software Coding"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 via-transparent to-[#0a0a0a]/90"></div>
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#ffb400]/5 blur-[150px] rounded-full"></div>
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#ffb400]/5 blur-[150px] rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            {[
              { val: 15, suffix: '+', label: 'Projects Delivered', y: y1 },
              { val: 15, suffix: '+', label: 'Happy Clients', y: y2 },
              { val: 10, suffix: '+', label: 'Tech Experts', y: y3 }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                style={{ y: stat.y }}
                whileInView={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                viewport={{ once: false }}
                className="flex flex-col items-center text-center group py-4"
              >
                {/* Floating Number with Shadow Depth */}
                <div className="relative mb-4">
                  <span className="text-8xl md:text-[120px] font-black text-white/90 tracking-tighter italic leading-none group-hover:text-[#ffb400] group-hover:scale-105 transition-all duration-700 block">
                    <Counter value={stat.val} suffix={stat.suffix} />
                  </span>
                  {/* Backdrop glowing number for depth */}
                  <span className="absolute inset-0 text-8xl md:text-[120px] font-black text-[#ffb400]/0 blur-2xl group-hover:text-[#ffb400]/20 transition-all duration-700 italic select-none pointer-events-none leading-none">
                    <Counter value={stat.val} suffix={stat.suffix} />
                  </span>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-[2px] bg-[#ffb400] scale-x-50 group-hover:scale-x-150 transition-transform duration-700"></div>
                  <span className="text-white font-black uppercase tracking-[0.4em] text-[10px] group-hover:translate-y-[-2px] transition-transform duration-500">
                    {stat.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-40 px-8 relative overflow-hidden bg-[#fafafa]">
        {/* Modern Background Elements - Noise & Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-40"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-36 items-start">
            {/* Left Content Header */}
            <div className="lg:col-span-12 xl:col-span-4 sticky top-32 flex flex-col gap-10">
              <div className="flex flex-col gap-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-[3px] bg-[#ffb400]"></div>
                  <span className="text-[#ffb400] font-black uppercase tracking-[0.5em] text-[10px]">Solutions Spectrum</span>
                </motion.div>
                <h2 className="text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.8]">
                  ELITE <br />
                  <span className="text-[#ffb400] not-italic">SERVICES.</span>
                </h2>
              </div>
              
              <p className="text-slate-500 leading-relaxed text-xl font-medium max-w-md">
                We don&apos;t just build features; we engineer competitive advantages through technological supremacy.
              </p>

              <div className="grid grid-cols-1 gap-4 pt-4">
                {[
                  { id: '01', t: 'Precision Engineering', d: 'Code built for absolute performance.' },
                  { id: '02', t: 'Visionary Design', d: 'UI that dictates market trends.' }
                ].map((item) => (
                  <div key={item.id} className="group flex items-start gap-6 p-6 rounded-[32px] bg-white border border-slate-100 hover:border-[#ffb400]/50 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-[#ffb400]/5">
                    <div className="text-3xl font-black text-[#ffb400]/20 group-hover:text-[#ffb400] transition-colors italic leading-none">{item.id}</div>
                    <div>
                      <h4 className="font-black text-[11px] uppercase tracking-widest text-slate-900 mb-1">{item.t}</h4>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side Services Grid */}
            <div className="lg:col-span-12 xl:col-span-6 grid md:grid-cols-2 gap-6">
              {serviceList.map((service, index) => (
                <motion.div 
                  key={index}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 40 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                  className="group relative bg-white p-8 rounded-[40px] border border-slate-100/80 shadow-2xl shadow-slate-200/50 hover:shadow-3xl hover:shadow-[#ffb400]/10 transition-all duration-700 flex flex-col items-start overflow-hidden"
                >
                  {/* Hover background impact */}
                  <div className="absolute top-0 left-0 w-full h-full bg-[#ffb400]/0 group-hover:bg-[#ffb400]/[0.02] transition-colors duration-700 pointer-events-none"></div>
                  
                  {/* Decorative Gradient Glow */}
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#ffb400]/0 group-hover:bg-[#ffb400]/10 blur-[80px] rounded-full transition-all duration-1000"></div>

                  {/* Icon Container with Advanced Animation */}
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-[#ffb400] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full"></div>
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:border-[#ffb400]/50 group-hover:bg-white group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-700 relative z-10">
                      <service.icon size={28} className="text-slate-900 group-hover:text-[#ffb400] transition-colors duration-500" />
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-start gap-3">
                    <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic group-hover:text-[#ffb400] transition-colors duration-500 leading-tight">
                      {service.title}
                    </h3>
                    
                    <p className="text-slate-500 leading-relaxed text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                      {service.desc}
                    </p>
                  </div>

                  {/* Top Right Corner Number Accent */}
                  <div className="absolute top-8 right-8 text-5xl font-black italic text-slate-50 pointer-events-none group-hover:text-[#ffb400]/10 transition-colors duration-700">
                    0{index + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions / Portfolio Section */}
<section id="portfolio" className="py-40 px-8 bg-[#FAF9F6] overflow-hidden relative">
        {/* Subtle decorative background element */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(#ffb400_0.7px,transparent_0.7px)] [background-size:32px_32px] opacity-[0.08]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center mb-32 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-[3px] bg-[#ffb400]"></div>
              <span className="text-[#ffb400] font-black uppercase tracking-[0.4em] text-[10px]">Recent Deployments</span>
              <div className="w-16 h-[3px] bg-[#ffb400]"></div>
            </div>
            <h2 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.85] tracking-tighter uppercase italic text-center">DIGITAL <br/><span className="text-[#ffb400] not-italic">PROJECTS.</span></h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {projectsList.map((proj, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative bg-slate-50/50 backdrop-blur-sm rounded-[2.5rem] p-3 border border-slate-200/40 hover:bg-white hover:border-[#ffb400]/50 transition-all duration-500 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_-20px_rgba(255,180,0,0.15)] flex flex-col"
              >
                <div className="relative h-72 overflow-hidden rounded-[2rem]">
                  <img 
                    src={proj.img} 
                    alt={proj.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl shadow-xl">
                    <span className="text-black font-black text-[10px] uppercase tracking-widest">{proj.cat}</span>
                  </div>
                </div>
                
                <div className="p-8 pb-10 flex flex-col flex-grow gap-5">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight italic leading-tight uppercase group-hover:text-[#ffb400] transition-colors duration-500">{proj.title}</h3>
                    <div className="w-12 h-1 bg-[#ffb400] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  </div>
                  
                  <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-2">
                    {proj.desc}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 py-2">
                    {proj.tags?.map((tag: string, tIndex: number) => (
                      <span 
                        key={tIndex} 
                        className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:bg-[#ffb400]/10 group-hover:border-[#ffb400]/20 group-hover:text-[#ffb400] transition-colors duration-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="pt-4 mt-auto">
                    <a 
                      href={proj.link || '#'} 
                      target={proj.link ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between bg-black text-white p-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#ffb400] hover:text-black transition-all group/btn shadow-lg shadow-black/10 hover:shadow-[#ffb400]/20"
                    >
                      <span className="flex items-center gap-3">
                        Launch Experience
                      </span>
                      <ArrowUpRight size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-40 px-8 relative overflow-hidden">
        {/* Background Image for Contact */}
        <div className="absolute inset-0 z-0">
           <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070" 
            className="w-full h-full object-cover opacity-100"
            alt="City Background"
           />
           <div className="absolute inset-0 bg-slate-900/95"></div>
        </div>
        
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ffb400] opacity-10 blur-[150px] -translate-y-1/2 translate-x-1/2 rounded-full z-0"></div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-24 relative z-10">
          <div className="lg:col-span-1 flex flex-col gap-20">
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-[3px] bg-[#ffb400]"></div>
                <span className="text-[#ffb400] font-black uppercase tracking-[0.4em] text-[10px]">Contact Us</span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-black leading-tight text-white tracking-tighter uppercase italic">
                LET&apos;S <br/>
                <span className="text-[#ffb400] not-italic relative">
                  TALK.
                  <motion.span 
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute bottom-2 left-0 h-2 bg-white/20 -z-10"
                  />
                </span>
              </h2>
              <p className="text-slate-400 leading-relaxed text-xl font-medium">
                We respond within 24 hours to help you optimize your company.
              </p>
            </div>

            <div className="flex flex-col gap-12">
              {[
                { icon: MapPin, title: 'Studio', val: 'Colombo, Sri Lanka', color: 'bg-slate-500/10' },
                { icon: Phone, title: 'Call Us', val: '+94 11 234 5678', color: 'bg-slate-500/10' },
                { icon: Mail, title: 'Email', val: 'sdksolutions01@.com', color: 'bg-slate-500/10' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-8 group"
                >
                  <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[28px] flex items-center justify-center shrink-0 group-hover:bg-[#ffb400] group-hover:border-[#ffb400] group-hover:rotate-12 transition-all duration-500 relative">
                    <item.icon className="text-[#ffb400] group-hover:text-black transition-colors relative z-10" size={32} />
                    <div className="absolute inset-0 bg-[#ffb400] rounded-[28px] opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                  </div>
                  <div>
                    <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-2">{item.title}</h4>
                    <p className="text-2xl font-black text-white tracking-tighter group-hover:text-[#ffb400] transition-colors">{item.val}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </section>

      <footer id="footer" className="bg-slate-950 pt-40 pb-20 px-8 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#ffb400]/5 -z-0 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#ffb400]/5 -z-0 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24 mb-32 relative z-10">
          {/* Brand Column */}
          <div className="flex flex-col gap-10">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image 
                  src="/sdklogo.png" 
                  alt="SDK Solutions Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
              <span className="text-3xl font-black text-white tracking-tighter italic uppercase">SDK <span className="text-[#ffb400] not-italic">Solutions</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed text-base font-medium">
              Empowering global enterprises through strategic consulting and innovative digital solutions. We turn complex challenges into seamless experiences.
            </p>
            <div className="flex items-center gap-4">
              {[
                { 
                  icon: (props: any) => (
                    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                    </svg>
                  ), 
                  href: '#', 
                  label: 'Facebook' 
                },
                { 
                  icon: (props: any) => (
                    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                    </svg>
                  ), 
                  href: '#', 
                  label: 'TikTok' 
                },
                { 
                  icon: (props: any) => (
                    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0zM7.12 19H3.85V8.11h3.27V19zM5.485 6.742c-1.05 0-1.897-.852-1.897-1.9s.847-1.9 1.897-1.9c1.048 0 1.895.852 1.895 1.9s-.847 1.9-1.895 1.9zM19 19h-3.27v-5.12c0-1.222-.022-2.795-1.703-2.795-1.705 0-1.966 1.332-1.966 2.707V19h-3.27V8.11h3.14v1.49h.044c.438-.83 1.508-1.706 3.107-1.706 3.322 0 3.935 2.187 3.935 5.03V19z" />
                    </svg>
                  ), 
                  href: '#', 
                  label: 'LinkedIn' 
                }
              ].map((social, idx) => (
                <a key={idx} href={social.href} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-black hover:bg-[#ffb400] hover:border-[#ffb400] transition-all duration-500 group" aria-label={social.label}>
                  <social.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-10">
            <h4 className="text-[#ffb400] font-black uppercase tracking-[0.4em] text-[10px]">Navigation</h4>
            <ul className="flex flex-col gap-5">
              {['Home', 'About', 'Services', 'Portfolio', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item === 'Portfolio' ? 'portfolio' : item.toLowerCase()}`} className="text-slate-400 hover:text-white transition-all text-sm font-bold uppercase tracking-widest flex items-center gap-2 group">
                    <div className="w-0 h-[2px] bg-[#ffb400] group-hover:w-4 transition-all duration-300"></div>
                    {item === 'Portfolio' ? 'Projects' : item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="flex flex-col gap-10">
            <h4 className="text-[#ffb400] font-black uppercase tracking-[0.4em] text-[10px]">What We Build</h4>
            <ul className="flex flex-col gap-5">
              {['Web Development', 'Mobile Apps', 'Cloud Solutions', 'UI/UX Design', 'API Systems', 'DevOps'].map((item) => (
                <li key={item}>
                  <a href="#services" className="text-slate-400 hover:text-white transition-all text-sm font-bold uppercase tracking-widest flex items-center gap-2 group">
                    <div className="w-0 h-[2px] bg-[#ffb400] group-hover:w-4 transition-all duration-300"></div>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-10">
            <h4 className="text-[#ffb400] font-black uppercase tracking-[0.4em] text-[10px]">Get in touch</h4>
            <div className="flex flex-col gap-8">
              {[
                { icon: MapPin, label: 'HQ Office', val: 'Colombo, Sri Lanka' },
                { icon: Phone, label: 'Direct Line', val: '+94 74 2216 579' },
                { icon: Mail, label: 'Email Address', val: 'sdksolutions01@.com' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#ffb400] group-hover:border-[#ffb400] transition-all duration-500">
                    <item.icon className="text-[#ffb400] group-hover:text-black transition-colors" size={24} />
                  </div>
                  <div>
                    <span className="block text-slate-500 font-black uppercase text-[10px] tracking-widest mb-1">{item.label}</span>
                    <span className="text-white font-black text-lg tracking-tighter italic group-hover:text-[#ffb400] transition-colors cursor-default block truncate">{item.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-16 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
             © 2026 SDK SOLUTIONS PVT LTD. <span className="hidden md:inline">|</span> CRAFTING DIGITAL EXCELLENCE.
          </p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Available for new projects</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
