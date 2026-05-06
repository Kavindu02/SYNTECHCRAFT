'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, LayoutDashboard, FolderKanban, Users, Eye, CalendarDays } from 'lucide-react'

interface Visit {
  id: string;
  userAgent: string;
  timestamp: string;
}

interface Stats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  recentVisits: Visit[];
}

export default function VisitorsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/analytics/stats', { cache: 'no-store' })
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
        <div className="hidden md:block bg-[#ffb400] p-2 rounded-xl">
          <img src="/logo.png" alt="Syntechcraft Logo" className="w-8 h-8 object-contain" />
        </div>
        <div className="flex md:flex-col gap-4 md:gap-8 md:flex-grow items-center">
          <Link href="/admin/dashboard" className="text-white/70 p-2.5 md:p-4 rounded-xl md:rounded-2xl hover:bg-white/10 transition-colors"><LayoutDashboard size={20} className="md:w-6 md:h-6" /></Link>
          <Link href="/admin/projects" className="text-white/70 p-2.5 md:p-4 rounded-xl md:rounded-2xl hover:bg-white/10 transition-colors"><FolderKanban size={20} className="md:w-6 md:h-6" /></Link>
          <Link href="/admin/visitors" className="text-[#ffb400] p-2.5 md:p-4 rounded-xl md:rounded-2xl bg-white/10 shadow-lg"><Users size={20} className="md:w-6 md:h-6" /></Link>
        </div>
        <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors md:mb-4 p-2.5 md:p-0"><LogOut size={20} className="md:w-6 md:h-6" /></button>
      </nav>

      <main className="pb-20 md:pb-0 md:pl-24">
        <header className="bg-white border-b border-slate-100 p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4 sticky top-0 z-40">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic uppercase"><span className="text-[#ffb400] not-italic">Visitors</span></h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">Website Traffic & Analytics</p>
          </div>
          <button
            onClick={fetchStats}
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
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Today's Visits</h3>
                <div className="p-2 bg-orange-50 text-orange-500 rounded-lg"><CalendarDays size={18} /></div>
              </div>
              <p className="text-3xl md:text-4xl font-black text-slate-900">
                {isLoading ? '-' : stats?.todayVisits || 0}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:gap-10">
            {/* Recent Visitors */}
            <div className="bg-white border border-slate-100 rounded-2xl md:rounded-[28px] p-6">
              <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-700 mb-6">Recent Visitors</h3>
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
    </div>
  )
}
