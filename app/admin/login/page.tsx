'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, User, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        router.push('/admin/dashboard')
      } else {
        const data = await res.json()
        setError(data.message || 'Invalid credentials')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(#ffb400_0.5px,transparent_1px)] [background-size:32px_32px] opacity-[0.15]"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="flex flex-col items-center mb-8 md:mb-12 text-center">
          <div className="bg-[#ffb400] p-2.5 md:p-3 rounded-xl md:rounded-2xl mb-4 md:mb-6 shadow-xl shadow-[#ffb400]/20">
            <Lock className="text-black" size={28} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Admin <span className="text-[#ffb400] not-italic">Login</span></h1>
          <p className="text-slate-500 font-medium mt-2 tracking-wide uppercase text-[9px] sm:text-[10px]">SDK Solutions Control Panel</p>
        </div>

        <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[40px] shadow-3xl border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-6 md:space-y-8">
            <div className="flex flex-col gap-2 md:gap-3">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-slate-400">Username</label>
              <div className="relative">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  suppressHydrationWarning
                  className="w-full bg-transparent border-b-2 border-slate-100 py-3 md:py-4 pl-8 outline-none focus:border-[#ffb400] transition-colors text-slate-900 font-bold placeholder:text-slate-200 text-sm md:text-base"
                  placeholder="Enter username" 
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:gap-3">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  suppressHydrationWarning
                  className="w-full bg-transparent border-b-2 border-slate-100 py-3 md:py-4 pl-8 outline-none focus:border-[#ffb400] transition-colors text-slate-900 font-bold placeholder:text-slate-200 text-sm md:text-base"
                  placeholder="Enter password" 
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
            )}

            <button 
              disabled={loading}
              suppressHydrationWarning
              className="w-full bg-black text-white px-6 md:px-8 py-4 md:py-6 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[9px] sm:text-[10px] hover:bg-[#ffb400] hover:text-black transition-all shadow-xl shadow-black/10 group flex items-center justify-center gap-3 md:gap-4 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />}
            </button>
          </form>
        </div>

        <div className="mt-8 md:mt-12 text-center">
          <a href="/" className="text-slate-400 hover:text-black font-black uppercase tracking-widest text-[9px] transition-colors">← Back to Main Site</a>
        </div>
      </motion.div>
    </div>
  )
}
