'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, LayoutDashboard, FolderKanban } from 'lucide-react'

interface Project {
  id?: number;
  title: string;
  cat: string;
  desc: string;
  tags: string[];
  img: string;
  link?: string;
  showOnHome?: boolean;
  homeSelectionOrder?: number | null;
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

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectionInputs, setSelectionInputs] = useState<Record<number, string>>({})
  const router = useRouter()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    try {
      const res = await fetch('/api/projects', { signal: controller.signal })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data)) {
        setProjects(asProjectsArray(data))
      }
    } catch {
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  useEffect(() => {
    const nextInputs: Record<number, string> = {}
    projects.forEach((project) => {
      if (project.id) {
        nextInputs[project.id] =
          project.showOnHome && typeof project.homeSelectionOrder === 'number'
            ? String(project.homeSelectionOrder)
            : ''
      }
    })
    setSelectionInputs(nextInputs)
  }, [projects])

  const handleSelectionOrderSave = async (project: Project, rawValue: string) => {
    if (!project.id) return

    const value = rawValue.trim()
    const parsedOrder = value === '' ? null : Number(value)

    if (parsedOrder !== null && (!Number.isInteger(parsedOrder) || parsedOrder < 1)) {
      alert('Please enter a valid positive number.')
      return
    }

    if (
      parsedOrder !== null &&
      projects.some(
        (item) => item.id !== project.id && item.showOnHome && item.homeSelectionOrder === parsedOrder
      )
    ) {
      alert('This number is already used by another selected project.')
      return
    }

    try {
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...project,
          showOnHome: parsedOrder !== null,
          homeSelectionOrder: parsedOrder,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        fetchProjects()
      } else {
        alert(data.error || 'Failed to update home selection')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred while updating home selection')
    }
  }

  const selectedProjects = projects
    .filter((project) => project.showOnHome)
    .sort((a, b) => (a.homeSelectionOrder ?? 99) - (b.homeSelectionOrder ?? 99))

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Sidebar Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 md:h-full md:w-24 md:left-0 md:right-auto md:top-0 bg-black flex md:flex-col items-center justify-around md:justify-start md:py-10 gap-4 md:gap-12 z-50 px-4 md:px-0">
        <div className="hidden md:block bg-[#ffb400] p-2 rounded-xl">
          <img src="/logo.png" alt="Syntechcraft Logo" className="w-8 h-8 object-contain" />
        </div>
        <div className="flex md:flex-col gap-4 md:gap-8 md:flex-grow items-center">
          <Link href="/admin/dashboard" className="text-[#ffb400] p-2.5 md:p-4 rounded-xl md:rounded-2xl bg-white/10 shadow-lg"><LayoutDashboard size={20} className="md:w-6 md:h-6" /></Link>
          <Link href="/admin/projects" className="text-white/70 p-2.5 md:p-4 rounded-xl md:rounded-2xl hover:bg-white/10 transition-colors"><FolderKanban size={20} className="md:w-6 md:h-6" /></Link>
        </div>
        <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors md:mb-4 p-2.5 md:p-0"><LogOut size={20} className="md:w-6 md:h-6" /></button>
      </nav>

      <main className="pb-20 md:pb-0 md:pl-24">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4 sticky top-0 z-40">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic uppercase"><span className="text-[#ffb400] not-italic">Dashboard</span></h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">Home Page Project Selection</p>
          </div>
          <Link
            href="/admin/projects"
            className="bg-black text-white px-5 md:px-8 py-3 md:py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#ffb400] hover:text-black transition-all text-center w-full sm:w-auto"
          >
            Manage All Projects
          </Link>
        </header>

        <div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto">
          <div className="mb-6 md:mb-10 bg-white border border-slate-100 rounded-2xl md:rounded-[28px] p-4 sm:p-6 md:p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-700 mb-2">Home Page Project Selection</h3>
            <p className="text-[11px] text-slate-500 mb-4">Selected: <span className="font-black text-slate-800">{selectedProjects.length}</span> (Home page shows first 9 only)</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.map((project) => (
                <label key={project.id ?? project.title} className="flex items-center justify-between gap-2 md:gap-3 border border-slate-100 rounded-xl px-3 md:px-4 py-3 bg-slate-50/60">
                  <span className="text-[12px] font-bold text-slate-700 line-clamp-1">{project.title}</span>
                  <input
                    type="number"
                    min={1}
                    value={project.id ? (selectionInputs[project.id] ?? '') : ''}
                    onChange={(e) => {
                      if (!project.id) return
                      setSelectionInputs((prev) => ({ ...prev, [project.id as number]: e.target.value }))
                    }}
                    onBlur={(e) => handleSelectionOrderSave(project, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSelectionOrderSave(project, (e.currentTarget as HTMLInputElement).value)
                      }
                    }}
                    placeholder="-"
                    className="w-16 h-9 text-center text-xs font-black border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-[#ffb400]"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
