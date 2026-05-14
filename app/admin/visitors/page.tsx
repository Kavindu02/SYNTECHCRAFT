'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, LayoutDashboard, FolderKanban, Users, Eye, CalendarDays, AlertTriangle } from 'lucide-react'

interface Visit {
  id: string;
  userAgent: string;
  timestamp: string;
}

interface Stats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  filteredCount: number | null;
  recentVisits: Visit[];
}

export default function VisitorsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchDate, setSearchDate] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchStats(searchDate)
  }, [searchDate])

  const fetchStats = async (date?: string) => {
    setIsLoading(true)
    try {
      // If date is empty string or undefined, fetch all recent stats
      const url = date ? `/api/analytics/stats?date=${date}` : '/api/analytics/stats'
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (err) {
      console.error('Failed to load stats', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="fixed bottom-0 left-0 right-0 h-16 md:h-full md:w-24 md:left-0 md:right-auto md:top-0 bg-black flex md:flex-col items-center justify-around md:justify-start md:py-10 gap-4 md:gap-12 z-50 px-4 md:px-0">
        <Link href="/" target="_blank" className="flex bg-[#ffb400] p-2 rounded-xl items-center justify-center">
          <img src="/logo.png" alt="Syntechcraft Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
        </Link>
        <div className="flex md:flex-col gap-4 md:gap-8 md:flex-grow items-center">
          <Link href="/admin/dashboard" className="text-white/70 p-2.5 md:p-4 rounded-xl md:rounded-2xl hover:bg-white/10 transition-colors"><LayoutDashboard size={20} className="md:w-6 md:h-6" /></Link>
          <Link href="/admin/projects" className="text-white/70 p-2.5 md:p-4 rounded-xl md:rounded-2xl hover:bg-white/10 transition-colors"><FolderKanban size={20} className="md:w-6 md:h-6" /></Link>
          <Link href="/admin/visitors" className="text-[#ffb400] p-2.5 md:p-4 rounded-xl md:rounded-2xl bg-white/10 shadow-lg"><Users size={20} className="md:w-6 md:h-6" /></Link>
        </div>
        <button onClick={() => setShowLogoutConfirm(true)} className="text-slate-500 hover:text-red-500 transition-colors md:mb-4 p-2.5 md:p-0"><LogOut size={20} className="md:w-6 md:h-6" /></button>
      </nav>

      <main className="pb-20 md:pb-0 md:pl-24">
        <header className="bg-white border-b border-slate-100 p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4 sticky top-0 z-40">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic uppercase"><span className="text-[#ffb400] not-italic">Visitors</span></h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">Website Traffic & Analytics</p>
          </div>
          <button
            onClick={() => fetchStats(searchDate)}
            className="bg-black text-white px-5 md:px-8 py-3 md:py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#ffb400] hover:text-black transition-all text-center w-full sm:w-auto"
          >
            Refresh Data
          </button>
        </header>

        <div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto space-y-6 md:space-y-10">

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl md:rounded-[28px] p-6 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Total Visits</h3>
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Eye size={18} /></div>
              </div>
              <p className="text-3xl md:text-4xl font-black text-slate-900">{isLoading ? '-' : stats?.totalVisits || 0}</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl md:rounded-[28px] p-6 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Unique Visitors</h3>
                <div className="p-2 bg-green-50 text-green-500 rounded-lg"><Users size={18} /></div>
              </div>
              <p className="text-3xl md:text-4xl font-black text-slate-900">{isLoading ? '-' : stats?.uniqueVisitors || 0}</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl md:rounded-[28px] p-6 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  {searchDate ? `Visits on ${searchDate}` : "Today's Visits"}
                </h3>
                <div className="p-2 bg-orange-50 text-orange-500 rounded-lg"><CalendarDays size={18} /></div>
              </div>
              <p className="text-3xl md:text-4xl font-black text-slate-900">
                {isLoading ? '-' : (searchDate ? stats?.filteredCount : stats?.todayVisits) ?? 0}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:gap-10">
            {/* Recent Visitors */}
            <div className="bg-white border border-slate-100 rounded-2xl md:rounded-[28px] p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-700">Recent Visitors</h3>
                <div className="relative w-full sm:w-64">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full pl-10 pr-24 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#ffb400] transition-colors"
                  />
                  {searchDate && (
                    <button
                      onClick={() => setSearchDate('')}
                      className="absolute right-9 top-1/2 -translate-y-1/2 bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm border border-red-100"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </div>
              {isLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Time</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Device/Browser</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recentVisits?.map((visit, i) => {
                        const dateObj = new Date(visit.timestamp);
                        return (
                          <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 pr-4 text-xs font-bold text-slate-600 whitespace-nowrap">
                              {dateObj.toLocaleDateString()}
                            </td>
                            <td className="py-3 pr-4 text-xs font-bold text-slate-600 whitespace-nowrap">
                              {dateObj.toLocaleTimeString()}
                            </td>
                            <td className="py-3 text-xs text-slate-500 max-w-[400px] truncate" title={visit.userAgent}>
                              {visit.userAgent}
                            </td>
                          </tr>
                        );
                      })}
                      {(!stats?.recentVisits || stats.recentVisits.length === 0) && (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-xs text-slate-400 italic">No recent visitors found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2rem] p-8 md:p-10 max-w-sm w-full shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#ffb400]" />
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle size={40} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-2">Confirm Logout</h3>
                <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">Are you sure you want to log out? You will need to sign in again to access the dashboard.</p>
                
                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-red-600 transition-all shadow-lg shadow-black/10"
                  >
                    Yes, Logout
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="w-full bg-slate-100 text-slate-900 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 transition-all"
                  >
                    No, Stay
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
