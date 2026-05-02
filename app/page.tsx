'use client'

import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import Image from 'next/image'
import { ContactForm } from '@/components/contact-form'
import { motion, useInView, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { CheckCircle2, BarChart3, PieChart, TrendingUp, Users, Briefcase, Globe, ArrowRight, MapPin, Phone, Mail, Rocket, Zap, Award, ArrowUpRight, Smartphone, Facebook, Linkedin, ArrowUp } from 'lucide-react'

interface Project {
  id?: number
  title: string
  cat: string
  desc: string
  tags: string[]
  img: string
  link?: string
  showOnHome?: boolean
  homeSelectionOrder?: number | null
}

function asProjectsArray(value: unknown): Project[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item, index) => {
    const candidate = item as Partial<Project>

    return {
      id: typeof candidate.id === 'number' ? candidate.id : index + 1,
      title: typeof candidate.title === 'string' ? candidate.title : '',
      cat: typeof candidate.cat === 'string' ? candidate.cat : '',
      desc: typeof candidate.desc === 'string' ? candidate.desc : '',
      tags: Array.isArray(candidate.tags) ? candidate.tags.filter((tag): tag is string => typeof tag === 'string') : [],
      img: typeof candidate.img === 'string' ? candidate.img : '',
      link: typeof candidate.link === 'string' ? candidate.link : '',
      showOnHome: Boolean(candidate.showOnHome),
      homeSelectionOrder:
        typeof candidate.homeSelectionOrder === 'number' && Number.isInteger(candidate.homeSelectionOrder)
          ? candidate.homeSelectionOrder
          : null,
    }
  })
}

function extractProjects(value: unknown): Project[] {
  if (Array.isArray(value)) {
    return asProjectsArray(value)
  }

  if (value && typeof value === 'object') {
    const candidate = value as { projects?: unknown; data?: unknown }

    if (Array.isArray(candidate.projects)) {
      return asProjectsArray(candidate.projects)
    }

    if (Array.isArray(candidate.data)) {
      return asProjectsArray(candidate.data)
    }
  }

  return []
}

function getHomeProjects(data: Project[]) {
  const selectedForHome = data
    .filter((project) => Boolean(project.showOnHome))
    .sort((a, b) => (a.homeSelectionOrder ?? 99) - (b.homeSelectionOrder ?? 99))

  return selectedForHome.length > 0 ? selectedForHome.slice(0, 9) : data.slice(0, 9)
}


// Languages/Tech Stack Data
const languages = [
  { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
  { name: 'Next.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg' },
  { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
  { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg' },
  { name: 'Tailwind', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg' },
  { name: 'MongoDB', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg' },
  { name: 'Express', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg' },
  { name: 'Firebase', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg' },
  { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
  { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
  { name: 'CodeIgniter', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/codeigniter/codeigniter-plain.svg' },
  { name: 'HTML', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
  { name: 'CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg' },
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
  // Only show the first 9 projects on the home page
  const [projectsList, setProjectsList] = useState<Project[]>([])

  useEffect(() => {
    const fetchProjects = async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000)

      try {
        const response = await fetch('/api/projects?lite=1', {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!response.ok) return
        const data = await response.json()
        const projectsData = extractProjects(data)
        setProjectsList(getHomeProjects(projectsData))
      } catch {
      } finally {
        clearTimeout(timeoutId)
      }
    }

    fetchProjects()
  }, [])

  const { scrollYProgress } = useScroll()

  // Unified floating motion for stats strip (keeps all counters on one line)
  const statsFloatY = useTransform(scrollYProgress, [0, 1], [18, -18])
  const aboutImageY = useTransform(scrollYProgress, [0, 1], [18, -18])
  const aboutImageRotate = useTransform(scrollYProgress, [0, 1], [-0.6, 0.6])
  const aboutImageScale = useTransform(scrollYProgress, [0, 1], [0.985, 1])
  const aboutImageTiltX = useMotionValue(0)
  const aboutImageTiltY = useMotionValue(0)
  const aboutImageHoverScale = useMotionValue(1)
  const aboutImageTiltXSpring = useSpring(aboutImageTiltX, { stiffness: 180, damping: 22, mass: 0.6 })
  const aboutImageTiltYSpring = useSpring(aboutImageTiltY, { stiffness: 180, damping: 22, mass: 0.6 })
  const aboutImageHoverScaleSpring = useSpring(aboutImageHoverScale, { stiffness: 220, damping: 24, mass: 0.55 })
  const aboutImageFinalScale = useTransform(
    [aboutImageScale, aboutImageHoverScaleSpring],
    ([baseScale, hoverScale]) => Number(baseScale) * Number(hoverScale)
  )

  const handleAboutImageMove = (event: MouseEvent<HTMLDivElement>) => {
    const { currentTarget, clientX, clientY } = event
    const rect = currentTarget.getBoundingClientRect()
    const pointerX = (clientX - rect.left) / rect.width - 0.5
    const pointerY = (clientY - rect.top) / rect.height - 0.5

    aboutImageTiltX.set(pointerY * -10)
    aboutImageTiltY.set(pointerX * 10)
    aboutImageHoverScale.set(1.015)
  }

  const handleAboutImageLeave = () => {
    aboutImageTiltX.set(0)
    aboutImageTiltY.set(0)
    aboutImageHoverScale.set(1)
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] scroll-smooth selection:bg-[#ffb400] selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <div id="home">
        <Hero />
      </div>

      {/* Trusted By / Logo Cloud - TRULY MODERN ADDITION */}
      <section className="py-12 md:py-20 border-b border-slate-100 bg-[#FAF9F6] overflow-hidden relative flex flex-col justify-center">
        {/* Background Watermark Text */}
        <div className="absolute top-[65%] left-[48%] -translate-x-1/2 -translate-y-1/2 font-black text-[11vw] leading-none tracking-normal text-slate-900/[0.03] whitespace-nowrap pointer-events-none select-none italic z-0 overflow-hidden w-full text-center scale-y-125">
          SYNTECHCRAFT
        </div>

        {/* Decorative background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(#ffb400_0.5px,transparent_1px)] [background-size:32px_32px] opacity-[0.15]"></div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F6] via-transparent to-[#FAF9F6] z-10 pointer-events-none hidden md:block opacity-40"></div>

        <div className="max-w-[100vw] w-full mx-auto relative z-0">
          <div className="flex flex-col items-center mb-10 md:mb-16 px-6 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="h-px w-6 md:w-8 bg-[#ffb400]"></div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-[#ffb400]">Tech Stack</p>
              <div className="h-px w-6 md:w-8 bg-[#ffb400]"></div>
            </motion.div>
            <h2 className="group text-2xl md:text-3xl font-black tracking-tighter italic text-center">
              <span className="text-slate-900 transition-colors duration-300 group-hover:text-[#ffb400]">TECHNOLOGIES</span>{' '}
              <span className="text-[#ffb400] not-italic transition-colors duration-300 group-hover:text-black">WE MASTER</span>
            </h2>
          </div>

          <div className="relative flex overflow-hidden w-screen left-1/2 -translate-x-1/2">
            <div className="flex animate-marquee whitespace-nowrap gap-6 md:gap-12 py-4 md:py-8 pl-6 md:pl-12">
              {[...languages, ...languages].map((lang, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="flex items-center gap-4 md:gap-5 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-[#ffb400]/30 hover:shadow-xl hover:shadow-[#ffb400]/5 transition-all duration-500 cursor-default shrink-0"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all duration-700">
                    <img src={lang.icon} alt={lang.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base md:text-lg font-black text-slate-900 tracking-tight leading-none mb-1">{lang.name}</span>
                    <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Ready</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section - ENHANCED MODERN */}
      <section id="about" className="py-16 md:py-28 px-6 md:px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-32 items-center relative">
        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-48 md:w-64 h-48 md:h-64 bg-[#ffb400]/5 blur-[80px] md:blur-[120px] rounded-full"></div>

        <div className="relative order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onMouseMove={handleAboutImageMove}
            onMouseLeave={handleAboutImageLeave}
            style={{
              y: aboutImageY,
              rotate: aboutImageRotate,
              scale: aboutImageFinalScale,
              rotateX: aboutImageTiltXSpring,
              rotateY: aboutImageTiltYSpring,
              transformPerspective: 1200,
            }}
            className="w-full aspect-[4/5] bg-slate-200 rounded-[40px] md:rounded-[60px] overflow-hidden border-[10px] md:border-[15px] border-white shadow-3xl relative z-10 group"
          >
            <img src="about.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt="SDK Team" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
            <div className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-22deg] translate-x-[-180%] group-hover:translate-x-[520%] transition-transform duration-1200 ease-out"></div>
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[40px] md:rounded-[60px]"></div>
          </motion.div>

          {/* Floating Experience Card */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 md:-top-12 md:-right-12 bg-[#ffb400] p-6 md:p-12 rounded-[30px] md:rounded-[40px] shadow-2xl z-20 hidden sm:block rotate-3"
          >
            <span className="block text-5xl md:text-8xl font-black text-black tracking-tighter italic leading-none">2+</span>
            <span className="block text-black font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px] mt-2 md:mt-4">Years Pioneering <br />Digital Frontiers</span>
          </motion.div>

          <div className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 w-full h-full border-[2px] md:border-[3px] border-dashed border-slate-200 rounded-[40px] md:rounded-[60px] -z-0"></div>
        </div>

        <div className="flex flex-col gap-8 md:gap-12 order-1 lg:order-2">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 md:w-16 h-[2px] bg-[#ffb400]"></div>
              <span className="text-[#ffb400] font-black uppercase tracking-[0.5em] text-[9px] md:text-[10px]">The SYNTECHCRAFT Standard</span>
            </div>
            <h2 className="group text-5xl md:text-6xl lg:text-8xl font-black leading-[0.9] md:leading-[0.8] tracking-tighter uppercase italic">
              <span className="text-slate-900 transition-colors duration-300 group-hover:text-[#ffb400]">WE TRANSFORM</span>{' '}
              <br /><span className="text-[#ffb400] not-italic transition-colors duration-300 group-hover:text-black">REALITY.</span>
            </h2>
          </div>

          <p className="text-slate-500 leading-relaxed text-lg md:text-xl font-medium max-w-xl">
            SYNTECHCRAFT isn&apos;t just a dev house. We are architects of the digital future, blending logic with aesthetics to build software that defines industries.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 pt-2 md:pt-4">
            {[
              { t: 'Modern Stack', d: 'React, Next.js, Node.js' },
              { t: 'Pure Design', d: 'Pixel-perfect UI/UX' },
              { t: 'Secure Core', d: 'Enterprise-grade safety' },
              { t: 'Fast Scale', d: 'High performance code' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2 md:gap-3 group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#ffb400] transition-all">
                    <CheckCircle2 size={18} className="text-[#ffb400] group-hover:text-black" />
                  </div>
                  <h4 className="font-black text-[11px] md:text-[12px] uppercase tracking-widest text-slate-900">{item.t}</h4>
                </div>
                <p className="text-slate-400 text-[10px] md:text-xs font-medium pl-12 md:pl-14">{item.d}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 md:pt-8 flex">
            <a href="#services" className="inline-flex items-center gap-4 md:gap-6 bg-black text-white px-8 py-5 md:px-10 md:py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px] hover:bg-[#ffb400] hover:text-black transition-all shadow-3xl shadow-black/10 group text-center">
              Discover Our Edge
              <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* TRULY MODERN Stats Section - Clean & Typographic */}
      <section className="relative py-10 md:py-14 overflow-hidden bg-[#0a0a0a]">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <motion.img
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070"
            className="w-full h-full object-cover opacity-25 scale-110 grayscale-[0.5]"
            alt="Advanced Software Coding"
            animate={{
              scale: [1.1, 1.16, 1.12, 1.1],
              x: [0, 18, -12, 0],
              y: [0, -10, 8, 0],
              rotate: [0, 0.25, -0.2, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 via-transparent to-[#0a0a0a]/90"></div>
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#ffb400]/5 blur-[100px] md:blur-[150px] rounded-full"></div>
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#ffb400]/5 blur-[100px] md:blur-[150px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-6 lg:px-8 relative z-10">
          <div className="flex flex-nowrap items-end justify-between gap-2 sm:gap-4 md:gap-5 lg:gap-8">
            {[
              { val: 20, suffix: '+', label: 'Projects Delivered' },
              { val: 15, suffix: '+', label: 'Happy Clients' },
              { val: 10, suffix: '+', label: 'Tech Experts' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                style={{ y: statsFloatY }}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 14 }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                viewport={{ once: false }}
                className="relative min-w-0 flex-1 flex flex-col items-center text-center group py-2 md:py-3 lg:py-4"
              >
                {/* Floating Number with Shadow Depth */}
                <div className="relative mb-2 md:mb-3 lg:mb-4">
                  <span className="text-4xl sm:text-6xl md:text-7xl lg:text-[120px] font-black text-white/90 tracking-tighter italic leading-none group-hover:text-[#ffb400] group-hover:scale-105 transition-all duration-700 block">
                    <Counter value={stat.val} suffix={stat.suffix} />
                  </span>
                  {/* Backdrop glowing number for depth */}
                  <span className="absolute inset-0 text-4xl sm:text-6xl md:text-7xl lg:text-[120px] font-black text-[#ffb400]/0 blur-2xl group-hover:text-[#ffb400]/20 transition-all duration-700 italic select-none pointer-events-none leading-none">
                    <Counter value={stat.val} suffix={stat.suffix} />
                  </span>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-[2px] bg-[#ffb400] scale-x-50 group-hover:scale-x-150 transition-transform duration-700"></div>
                  <span className="text-white font-black uppercase whitespace-nowrap tracking-[0.2em] sm:tracking-[0.35em] md:tracking-[0.25em] lg:tracking-[0.35em] text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] leading-none group-hover:translate-y-[-2px] transition-transform duration-500">
                    {stat.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-28 px-6 md:px-8 relative overflow-hidden bg-[#FAF9F6]">
        {/* Modern Background Elements - Noise & Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(rgba(0,0,0,0.4)_0.5px,transparent_0.5px)] [background-size:3px_3px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-40"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-36 items-start">
            {/* Left Content Header */}
            <div className="lg:col-span-12 xl:col-span-4 lg:sticky lg:top-32 flex flex-col gap-8 md:gap-10">
              <div className="flex flex-col gap-4 md:gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 md:w-12 h-[3px] bg-[#ffb400]"></div>
                  <span className="text-[#ffb400] font-black uppercase tracking-[0.5em] text-[9px] md:text-[10px]">Solutions Spectrum</span>
                </motion.div>
                <h2 className="group text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] md:leading-[0.8]">
                  <span className="text-slate-900 transition-colors duration-300 group-hover:text-[#ffb400]">ELITE</span>{' '}<br />
                  <span className="text-[#ffb400] not-italic transition-colors duration-300 group-hover:text-black">SERVICES.</span>
                </h2>
              </div>

              <p className="text-slate-500 leading-relaxed text-lg md:text-xl font-medium max-w-md">
                We don&apos;t just build features; we engineer competitive advantages through technological supremacy.
              </p>

              <div className="grid grid-cols-1 gap-4 pt-4">
                {[
                  { id: '01', t: 'Precision Engineering', d: 'Code built for absolute performance.' },
                  { id: '02', t: 'Visionary Design', d: 'UI that dictates market trends.' }
                ].map((item) => (
                  <div key={item.id} className="group flex items-start gap-6 p-6 rounded-[24px] md:rounded-[32px] bg-white border border-slate-100 hover:border-[#ffb400]/50 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-[#ffb400]/5">
                    <div className="text-2xl md:text-3xl font-black text-[#ffb400]/20 group-hover:text-[#ffb400] transition-colors italic leading-none">{item.id}</div>
                    <div>
                      <h4 className="font-black text-[10px] md:text-[11px] uppercase tracking-widest text-slate-900 mb-1">{item.t}</h4>
                      <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-tight">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side Services Grid */}
            <div className="lg:col-span-12 xl:col-span-6 grid sm:grid-cols-2 gap-6">
              {serviceList.map((service, index) => (
                <motion.div
                  key={index}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 40 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                  className="group relative bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100/80 shadow-2xl shadow-slate-200/50 hover:shadow-3xl hover:shadow-[#ffb400]/10 transition-all duration-700 flex flex-col items-start overflow-hidden"
                >
                  {/* Hover background impact */}
                  <div className="absolute top-0 left-0 w-full h-full bg-[#ffb400]/0 group-hover:bg-[#ffb400]/[0.02] transition-colors duration-700 pointer-events-none"></div>

                  {/* Decorative Gradient Glow */}
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#ffb400]/0 group-hover:bg-[#ffb400]/10 blur-[80px] rounded-full transition-all duration-1000"></div>

                  {/* Icon Container with Advanced Animation */}
                  <div className="relative mb-6 md:mb-8">
                    <div className="absolute inset-0 bg-[#ffb400] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full"></div>
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center border border-slate-100 group-hover:border-[#ffb400]/50 group-hover:bg-white group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-700 relative z-10">
                      <service.icon size={24} className="text-slate-900 group-hover:text-[#ffb400] transition-colors duration-500" />
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col items-start gap-3">
                    <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter uppercase italic group-hover:text-[#ffb400] transition-colors duration-500 leading-tight">
                      {service.title}
                    </h3>

                    <p className="text-slate-500 leading-relaxed text-xs md:text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                      {service.desc}
                    </p>
                  </div>

                  {/* Top Right Corner Number Accent */}
                  <div className="absolute top-6 md:top-8 right-6 md:right-8 text-4xl md:text-5xl font-black italic text-slate-50 pointer-events-none group-hover:text-[#ffb400]/10 transition-colors duration-700">
                    0{index + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions / Portfolio Section */}
      <section id="portfolio" className="py-16 md:py-28 px-6 md:px-8 bg-[#FAF9F6] overflow-hidden relative">
        {/* Subtle decorative background element */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(#ffb400_0.7px,transparent_0.7px)] [background-size:32px_32px] opacity-[0.08]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 md:mb-20 gap-4 md:gap-6">
            <div className="flex flex-col items-start text-left flex-1">
              <div className="flex items-center gap-4 justify-start w-full">
                <div className="w-12 md:w-16 h-[3px] bg-[#ffb400]"></div>
                <span className="text-[#ffb400] font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px]">Recent Deployments</span>
                <div className="w-12 md:w-16 h-[3px] bg-[#ffb400]"></div>
              </div>
              <div className="group flex flex-col items-start mt-4 w-full">
                <span className="text-5xl md:text-6xl lg:text-8xl font-black italic text-slate-900 leading-[0.9] md:leading-[0.85] tracking-tight uppercase text-left transition-colors duration-300 group-hover:text-[#ffb400]">DIGITAL</span>
                <span className="text-5xl md:text-6xl lg:text-8xl font-black text-[#ffb400] leading-[0.9] md:leading-[0.85] tracking-tight uppercase text-left mt-2 transition-colors duration-300 group-hover:text-black">PROJECTS.</span>
              </div>
            </div>
            <div className="w-full flex justify-end items-end pb-70">
              <a
                href="/projects"
                className="min-w-[180px] flex items-center justify-between bg-black text-white px-8 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[12px] hover:bg-[#ffb400] hover:text-black transition-all group/btn shadow-xl shadow-black/10 hover:shadow-[#ffb400]/20 hidden md:flex"
              >
                <span className="flex items-center gap-4">View All Projects</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="group-hover/btn:translate-x-2 group-hover/btn:-translate-y-1 transition-transform duration-300">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {projectsList.map((proj, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative bg-slate-50/50 backdrop-blur-sm rounded-[2rem] md:rounded-[2.5rem] p-3 border border-slate-200/40 hover:bg-white hover:border-[#ffb400]/50 transition-all duration-500 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_-20px_rgba(255,180,0,0.15)] flex flex-col"
              >
                <div className="relative h-60 md:h-72 overflow-hidden rounded-[1.8rem] md:rounded-[2rem]">
                  <img
                    src={proj.img || '/logo.png'}
                    alt={proj.title}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="absolute top-4 md:top-6 left-4 md:left-6 bg-white/95 backdrop-blur-md border border-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl shadow-xl">
                    <span className="text-black font-black text-[9px] md:text-[10px] uppercase tracking-widest">{proj.cat}</span>
                  </div>
                </div>

                <div className="p-6 md:p-8 pb-8 md:pb-10 flex flex-col flex-grow gap-4 md:gap-5">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight italic leading-tight uppercase group-hover:text-[#ffb400] transition-colors duration-500">{proj.title}</h3>
                    <div className="w-10 md:w-12 h-1 bg-[#ffb400] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  </div>

                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
                    {proj.desc}
                  </p>

                  <div className="flex flex-wrap gap-2 py-1 md:py-2">
                    {proj.tags?.map((tag: string, tIndex: number) => (
                      <span
                        key={tIndex}
                        className="px-3 py-1 md:px-4 md:py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:bg-[#ffb400]/10 group-hover:border-[#ffb400]/20 group-hover:text-[#ffb400] transition-colors duration-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 md:pt-4 mt-auto">
                    <a
                      href={proj.link || '#'}
                      target={proj.link ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between bg-black text-white p-4 md:p-5 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#ffb400] hover:text-black transition-all group/btn shadow-lg shadow-black/10 hover:shadow-[#ffb400]/20"
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
            {/* Mobile only: View All Projects button below grid */}
            <div className="w-full flex justify-center mt-8 md:hidden">
              <a
                href="/projects"
                className="min-w-[140px] flex items-center justify-between bg-black text-white px-5 py-3 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#ffb400] hover:text-black transition-all group/btn shadow-xl shadow-black/10 hover:shadow-[#ffb400]/20"
              >
                <span className="flex items-center gap-3">View All Projects</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="group-hover/btn:translate-x-2 group-hover/btn:-translate-y-1 transition-transform duration-300">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-28 px-6 md:px-8 relative overflow-hidden">
        {/* Background Image for Contact */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"
            className="w-full h-full object-cover opacity-100"
            alt="City Background"
          />
          <div className="absolute inset-0 bg-slate-900/95"></div>
        </div>

        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#ffb400] opacity-10 blur-[100px] md:blur-[150px] -translate-y-1/2 translate-x-1/2 rounded-full z-0"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-16 lg:gap-24 relative z-10">
          <div className="lg:col-span-1 flex flex-col gap-8 md:gap-14">
            <div className="flex flex-col gap-6 md:gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 md:w-16 h-[3px] bg-[#ffb400]"></div>
                <span className="text-[#ffb400] font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px]">Contact Us</span>
              </div>
              <h2 className="group text-5xl md:text-7xl font-black leading-tight tracking-tighter uppercase italic">
                <span className="text-white transition-colors duration-300 group-hover:text-[#ffb400]">LET&apos;S</span>{' '}<br />
                <span className="text-[#ffb400] not-italic relative transition-colors duration-300 group-hover:text-black">
                  TALK.
                  <motion.span
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute bottom-1 md:bottom-2 left-0 h-1 md:h-2 bg-white/20 -z-10"
                  />
                </span>
              </h2>
              <p className="text-slate-400 leading-relaxed text-lg md:text-xl font-medium">
                We respond within 24 hours to help you optimize your company.
              </p>
            </div>

            <div className="flex flex-col gap-4 md:gap-6">
              {[
                { icon: MapPin, title: 'Company', val: 'Colombo, Sri Lanka', color: 'bg-slate-500/10' },
                { icon: Phone, title: 'Call Us', val: '+94 74 2216 579', color: 'bg-slate-500/10' },
                { icon: Mail, title: 'Email', val: 'syntechcraft@gmail.com', color: 'bg-slate-500/10' }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-5 md:gap-6 group"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#ffb400] group-hover:border-[#ffb400] group-hover:rotate-12 transition-all duration-500 relative">
                    <item.icon className="text-[#ffb400] group-hover:text-black transition-colors relative z-10 w-5 h-5 md:w-6 md:h-6" />
                    <div className="absolute inset-0 bg-[#ffb400] rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-black text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-slate-500 mb-1">{item.title}</h4>
                    <p className="text-base md:text-lg font-black text-white group-hover:text-[#ffb400] transition-colors">{item.val}</p>
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

      <footer id="footer" className="bg-slate-950 pt-16 md:pt-28 pb-10 md:pb-14 px-6 md:px-8 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#ffb400]/5 -z-0 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-[#ffb400]/5 -z-0 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-24 mb-20 md:mb-32 relative z-10">
          {/* Brand Column */}
          <div className="flex flex-col gap-8 md:gap-10">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <Image
                  src="/logo.png"
                  alt="SYNTECHCRAFT Logo"
                  fill
                  sizes="(max-width: 768px) 40px, 48px"
                  className="object-contain"
                />
              </div>
              <span className="text-2xl md:text-2xl font-black text-white tracking-tighter italic uppercase">SYN <span className="text-[#ffb400] not-italic">TECHCRAFT</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
              Empowering global enterprises through strategic consulting and innovative digital solutions. We turn complex challenges into seamless experiences.
            </p>
            <div className="flex items-center gap-4">
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
                  href: 'https://www.tiktok.com/@syntechcraft?_r=1&_t=ZS-94OiWFI4GB7',
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
                },
                {
                  icon: (props: any) => (
                    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  ),
                  href: 'https://wa.me/94742216579',
                  label: 'WhatsApp'
                }
              ].map((social, idx) => (
                <a key={idx} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-black hover:bg-[#ffb400] hover:border-[#ffb400] transition-all duration-500 group" aria-label={social.label}>
                  <social.icon className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-8 md:gap-10">
            <h4 className="text-[#ffb400] font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px]">Navigation</h4>
            <ul className="flex flex-col gap-4 md:gap-5">
              {['Home', 'About', 'Services', 'Portfolio', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item === 'Portfolio' ? 'portfolio' : item.toLowerCase()}`} className="text-slate-400 hover:text-white transition-all text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2 group">
                    <div className="w-0 h-[2px] bg-[#ffb400] group-hover:w-4 transition-all duration-300"></div>
                    {item === 'Portfolio' ? 'Projects' : item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="flex flex-col gap-8 md:gap-10">
            <h4 className="text-[#ffb400] font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px]">What We Build</h4>
            <ul className="flex flex-col gap-4 md:gap-5">
              {['Web Development', 'Mobile Apps', 'Cloud Solutions', 'UI/UX Design', 'API Systems', 'DevOps'].map((item) => (
                <li key={item}>
                  <a href="#services" className="text-slate-400 hover:text-white transition-all text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2 group">
                    <div className="w-0 h-[2px] bg-[#ffb400] group-hover:w-4 transition-all duration-300"></div>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-8 md:gap-10">
            <h4 className="text-[#ffb400] font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px]">Get in touch</h4>
            <div className="flex flex-col gap-6 md:gap-8">
              {[
                { icon: MapPin, label: 'HQ Office', val: 'Colombo, Sri Lanka' },
                { icon: Phone, label: 'Direct Line', val: '+94 74 2216 579' },
                { icon: Mail, label: 'Email Address', val: 'syntechcraft@gmail.com' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-5 md:gap-6 group">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#ffb400] group-hover:border-[#ffb400] transition-all duration-500">
                    <item.icon className="text-[#ffb400] group-hover:text-black transition-colors w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="block text-slate-500 font-extrabold uppercase text-[8px] md:text-[9px] tracking-[0.2em] mb-1">{item.label}</span>
                    <span className="text-white font-bold text-base md:text-lg italic group-hover:text-[#ffb400] transition-colors cursor-default block whitespace-nowrap">{item.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-12 md:pt-16 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 relative z-10">
          <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest text-center md:text-left">
            © 2026 SYNTECHCRAFT PVT LTD. <span className="hidden md:inline">|</span> CRAFTING DIGITAL EXCELLENCE.
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
