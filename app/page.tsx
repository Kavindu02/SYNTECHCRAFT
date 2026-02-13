'use client'

import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { CheckCircle2, BarChart3, PieChart, TrendingUp, Users, Briefcase, Globe, ArrowRight, MapPin, Phone, Mail, Rocket, Zap, Award } from 'lucide-react'

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: false, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    } else {
      motionValue.set(0);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US").format(Math.floor(latest)) + suffix;
      }
    });
    return () => unsubscribe();
  }, [springValue, suffix]);

  return <span ref={ref} className="tabular-nums" />;
}

const serviceList = [
  { icon: BarChart3, title: 'Web Development', desc: 'Crafting high-performance, scalable web applications using modern stacks.' },
  { icon: PieChart, title: 'Mobile Solutions', desc: 'Custom iOS and Android apps designed for exceptional user experiences.' },
  { icon: TrendingUp, title: 'Cloud Infrastructure', desc: 'Architecting secure and resilient cloud systems for global scale.' },
  { icon: Users, title: 'UI/UX Design', desc: 'User-centric design that blends aesthetics with functional excellence.' },
  { icon: Briefcase, title: 'Enterprise Software', desc: 'Tailored systems to streamline complex business processes and operations.' },
  { icon: Globe, title: 'API Integration', desc: 'Seamlessly connecting your ecosystem with robust third-party services.' },
]

const projects = [
  { title: 'E-Commerce Engine', cat: 'Web App', img: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=2089' },
  { title: 'Fintech Mobile App', cat: 'Mobile', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470' },
  { title: 'Inventory System', cat: 'Enterprise', img: 'https://images.unsplash.com/photo-1504868584819-f8e905263543?q=80&w=1471' },
  { title: 'Real-time Dashboard', cat: 'SaaS', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2026' },
  { title: 'Healthcare Portal', cat: 'Cloud', img: 'https://images.unsplash.com/photo-1576091160550-217359f41f02?q=80&w=1470' },
  { title: 'Logistics Tracker', cat: 'Logistics', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1470' },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white scroll-smooth selection:bg-[#ffb400] selection:text-black">
      <Navbar />
      
      {/* Hero Section */}
      <div id="home">
        <Hero />
      </div>

      {/* Trusted By / Logo Cloud - TRULY MODERN ADDITION */}
      <section className="py-20 border-b border-slate-50 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 text-center mb-12">Powering global innovation at</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
             {['MICROSOFT', 'GOOGLE', 'AMAZON', 'NETFLIX', 'TESLA'].map((brand) => (
               <span key={brand} className="text-2xl font-black tracking-tighter text-slate-900 italic">{brand}</span>
             ))}
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
      <section className="relative py-20 overflow-hidden bg-[#0a0a0a]">
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
              { val: 15, suffix: '+', label: 'Projects Delivered', desc: 'Digital Excellence' },
              { val: 15, suffix: '+', label: 'Happy Clients', desc: 'Global Trust' },
              { val: 10, suffix: '+', label: 'Tech Experts', desc: 'Core Engineering' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 30 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center text-center group"
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
      <section id="services" className="py-40 px-8 relative overflow-hidden bg-white">
        {/* Modern Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 translate-x-1/2"></div>
        <div className="absolute top-[20%] left-[-5%] w-[400px] h-[400px] bg-[#ffb400]/5 rounded-full blur-[100px] animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-20 items-start">
            {/* Left Content Header */}
            <div className="lg:col-span-4 sticky top-32 flex flex-col gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-[2px] bg-[#ffb400]"></div>
                <span className="text-[#ffb400] font-black uppercase tracking-[0.4em] text-[10px]">What we do</span>
              </div>
              <h2 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.85]">
                TECH <br />
                <span className="text-[#ffb400] not-italic">EXCELLENCE.</span>
              </h2>
              <p className="text-slate-500 leading-relaxed text-lg font-medium">
                We deliver high-end digital solutions tailored to your business needs, ensuring peak performance and scalability.
              </p>
              <div className="flex flex-col gap-4 pt-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-6 group hover:bg-[#ffb400] transition-all cursor-default shadow-sm border-l-4 border-l-[#ffb400]">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black font-black italic shadow-inner">01</div>
                  <span className="text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] group-hover:text-black">Strategy First</span>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-6 group hover:bg-[#ffb400] transition-all cursor-default shadow-sm border-l-4 border-l-[#ffb400]">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black font-black italic shadow-inner">02</div>
                  <span className="text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] group-hover:text-black">Design Thinking</span>
                </div>
              </div>
            </div>

            {/* Right Side Services Grid */}
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-8">
              {serviceList.map((service, index) => (
                <motion.div 
                  key={index}
                  whileInView={{ opacity: 1, scale: 1 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-12 rounded-[50px] border border-slate-100/60 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-[#ffb400]/10 transition-all group relative overflow-hidden"
                >
                  {/* Decorative Number */}
                  <span className="absolute -top-6 -right-6 text-9xl font-black text-slate-500/5 italic select-none group-hover:text-[#ffb400]/10 transition-colors">
                    0{index + 1}
                  </span>

                  <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mb-10 group-hover:bg-[#ffb400] transition-all border border-slate-50 group-hover:scale-110 group-hover:rotate-6">
                    <service.icon size={36} className="text-[#ffb400] group-hover:text-black transition-colors" />
                  </div>
                  
                  <h3 className="text-2xl font-black mb-4 text-slate-900 uppercase tracking-tighter group-hover:text-[#ffb400] transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-slate-500 leading-relaxed text-sm font-medium mb-8">
                    {service.desc}
                  </p>

                  <div className="h-1 w-0 bg-[#ffb400] absolute bottom-0 left-0 transition-all duration-500 group-hover:w-full"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions / Portfolio Section */}
      <section id="portfolio" className="py-40 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-[3px] bg-[#ffb400]"></div>
              <span className="text-[#ffb400] font-black uppercase tracking-[0.4em] text-[10px]">Recent Deployments</span>
            </div>
            <h2 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.85] tracking-tighter uppercase italic">DIGITAL <br/><span className="text-[#ffb400] not-italic">PRODUCTS.</span></h2>
          </div>
          <button className="bg-slate-50 text-slate-900 px-12 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] border border-slate-100 hover:bg-black hover:text-white transition-all shadow-sm">
            View All Builds
          </button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((proj, index) => (
            <motion.div 
              key={index}
              whileInView={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-[500px] overflow-hidden rounded-[40px] cursor-pointer border border-slate-100 bg-slate-50"
            >
              <img src={proj.img} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" alt={proj.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-12 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-[2px] bg-[#ffb400]"></div>
                  <span className="text-[#ffb400] font-bold uppercase tracking-widest text-[10px]">{proj.cat}</span>
                </div>
                <h3 className="text-3xl font-black mb-6 text-white tracking-tighter uppercase">{proj.title}</h3>
                <div className="flex items-center gap-3 text-white/50 group-hover:text-[#ffb400] transition-colors font-black text-[10px] uppercase tracking-widest">
                  <span>View Case Study</span>
                  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </div>
                <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowRight className="text-white -rotate-45" size={20} />
                </div>
              </div>
            </motion.div>
          ))}
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
              <h2 className="text-5xl lg:text-7xl font-black leading-tight text-white tracking-tighter uppercase italic">LET&apos;S <br/><span className="text-[#ffb400] not-italic">TALK.</span></h2>
              <p className="text-slate-400 leading-relaxed text-xl font-medium">
                We respond within 24 hours to help you optimize your company.
              </p>
            </div>

            <div className="flex flex-col gap-12">
              {[
                { icon: MapPin, title: 'Studio', val: 'Columbo, Sri Lanka' },
                { icon: Phone, title: 'Call Us', val: '+94 11 234 5678' },
                { icon: Mail, title: 'Email', val: 'hello@consultio.com' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-8 group">
                  <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center shrink-0 group-hover:bg-[#ffb400] group-hover:border-[#ffb400] transition-all duration-500">
                    <item.icon className="text-[#ffb400] group-hover:text-black transition-colors" size={32} />
                  </div>
                  <div>
                    <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-2">{item.title}</h4>
                    <p className="text-2xl font-black text-white tracking-tighter group-hover:text-[#ffb400] transition-colors">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-12 md:p-20 rounded-[60px] shadow-3xl">
            <form className="grid sm:grid-cols-2 gap-16">
              <div className="flex flex-col gap-5">
                <label className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Full Name</label>
                <input type="text" className="bg-transparent border-b-2 border-slate-100 py-6 outline-none focus:border-[#ffb400] transition-colors text-slate-900 text-xl font-bold placeholder:text-slate-200" placeholder="John Doe" />
              </div>
              <div className="flex flex-col gap-5">
                <label className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Email Address</label>
                <input type="email" className="bg-transparent border-b-2 border-slate-100 py-6 outline-none focus:border-[#ffb400] transition-colors text-slate-900 text-xl font-bold placeholder:text-slate-200" placeholder="john@example.com" />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-5">
                <label className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Message</label>
                <textarea rows={4} className="bg-transparent border-b-2 border-slate-100 py-6 outline-none focus:border-[#ffb400] transition-colors text-slate-900 text-xl font-bold placeholder:text-slate-200 resize-none" placeholder="Tell us about your project..."></textarea>
              </div>
              <div className="sm:col-span-2">
                <button className="w-full bg-black text-white font-black py-10 rounded-[30px] hover:bg-[#ffb400] hover:text-black transition-all uppercase tracking-[0.6em] text-[10px] shadow-2xl flex items-center justify-center gap-6 group">
                  Send Your Inquiry
                  <ArrowRight size={24} className="group-hover:translate-x-3 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="footer" className="bg-white pt-40 pb-20 px-8 relative border-t border-slate-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-slate-50 -z-0"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24 mb-32 relative z-10">
          {/* Brand Column */}
          <div className="flex flex-col gap-10">
            <div className="flex items-center gap-3">
              <div className="bg-[#ffb400] p-2 rounded-xl">
                <div className="w-8 h-8 border-2 border-black flex items-center justify-center font-black text-black text-xs tracking-tighter">
                  SDK
                </div>
              </div>
              <span className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">SDK <span className="text-[#ffb400] not-italic">Solutions</span></span>
            </div>
            <p className="text-slate-500 leading-relaxed text-base font-medium">
              Empowering global enterprises through strategic consulting and innovative digital solutions.
            </p>
            <div className="flex items-center gap-4">
              {['FB', 'TW', 'LN', 'IG'].map((social) => (
                <a key={social} href="#" className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black hover:bg-[#ffb400] hover:border-[#ffb400] transition-all duration-300 text-[10px] font-black tracking-widest">
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-10">
            <h4 className="text-slate-900 font-black uppercase tracking-[0.4em] text-[10px]">Navigation</h4>
            <ul className="flex flex-col gap-5">
              {['Home', 'About', 'Services', 'Portfolio', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item === 'Portfolio' ? 'portfolio' : item.toLowerCase()}`} className="text-slate-500 hover:text-[#ffb400] transition-colors text-sm font-bold uppercase tracking-widest">
                    {item === 'Portfolio' ? 'Projects' : item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="flex flex-col gap-10">
            <h4 className="text-slate-900 font-black uppercase tracking-[0.4em] text-[10px]">What We Build</h4>
            <ul className="flex flex-col gap-5">
              {['Web Apps', 'Mobile Apps', 'Cloud Architecture', 'UI/UX Design', 'API Systems'].map((item) => (
                <li key={item}>
                  <a href="#services" className="text-slate-500 hover:text-[#ffb400] transition-colors text-sm font-bold uppercase tracking-widest">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-10">
            <h4 className="text-slate-900 font-black uppercase tracking-[0.4em] text-[10px]">Get in touch</h4>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col">
                <span className="text-slate-300 font-black uppercase text-[10px] tracking-widest mb-1">HQ Office</span>
                <span className="text-slate-900 font-black text-lg tracking-tighter italic">Columbo, Sri Lanka</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-300 font-black uppercase text-[10px] tracking-widest mb-1">Direct Line</span>
                <span className="text-slate-900 font-black text-lg tracking-tighter italic">+94 11 234 5678</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-16 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
             © 2026 SDK SOLUTIONS PVT LTD. <span className="hidden md:inline">|</span> CRAFTING DIGITAL EXCELLENCE.
          </p>
          <div className="flex items-center gap-10">
            <a href="#" className="text-slate-400 hover:text-[#ffb400] text-xs font-bold uppercase tracking-widest transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-[#ffb400] text-xs font-bold uppercase tracking-widest transition-colors">Terms</a>
            <a href="#" className="text-slate-400 hover:text-[#ffb400] text-xs font-bold uppercase tracking-widest transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
