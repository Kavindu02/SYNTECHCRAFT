'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, LogOut, LayoutDashboard, Globe, Tag, Image as ImageIcon, FileText, ChevronRight, Edit2, Link as LinkIcon, Upload } from 'lucide-react'

interface Project {
  title: string;
  cat: string;
  desc: string;
  tags: string[];
  img: string;
  link?: string;
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [oldTitle, setOldTitle] = useState('')
  const [newProject, setNewProject] = useState<Project>({
    title: '',
    cat: '',
    desc: '',
    tags: [],
    img: '',
    link: ''
  })
  const [tagInput, setTagInput] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewProject({ ...newProject, img: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = '/api/projects'
      const method = editMode ? 'PUT' : 'POST'
      const body = editMode ? { ...newProject, oldTitle } : newProject

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        resetForm()
        fetchProjects()
      } else {
        alert(data.error || 'Failed to save project')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred while saving the project')
    }
  }

  const resetForm = () => {
    setNewProject({ title: '', cat: '', desc: '', tags: [], img: '', link: '' })
    setTagInput('')
    setShowAddForm(false)
    setEditMode(false)
    setOldTitle('')
  }

  const handleEditClick = (proj: Project) => {
    setNewProject(proj)
    setTagInput(proj.tags.join(', '))
    setOldTitle(proj.title)
    setEditMode(true)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteProject = async (title: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      const res = await fetch('/api/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        fetchProjects()
      } else {
        alert(data.error || 'Failed to delete project')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred while deleting the project')
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Sidebar Nav */}
      <nav className="fixed left-0 top-0 h-full w-24 bg-black flex flex-col items-center py-10 gap-12 z-50">
        <div className="bg-[#ffb400] p-2 rounded-xl">
          <div className="w-8 h-8 border-2 border-black flex items-center justify-center font-black text-black text-xs tracking-tighter">SDK</div>
        </div>
        <div className="flex flex-col gap-8 flex-grow">
          <button className="text-[#ffb400] p-4 rounded-2xl bg-white/10 shadow-lg"><LayoutDashboard size={24} /></button>
        </div>
        <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors mb-4"><LogOut size={24} /></button>
      </nav>

      <main className="pl-24">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 p-8 flex justify-between items-center sticky top-0 z-40">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">CMS <span className="text-[#ffb400] not-italic">Dashboard</span></h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">Manage Your Portfolio Projects</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#ffb400] hover:text-black transition-all flex items-center gap-3"
          >
            {showAddForm ? 'Close Form' : <><Plus size={16} /> Add New Project</>}
          </button>
        </header>

        <div className="p-12 max-w-7xl mx-auto">
          <AnimatePresence>
            {showAddForm && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-12"
              >
                <div className="bg-white border border-slate-100 rounded-[40px] p-12 shadow-2xl">
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic mb-8 flex items-center gap-4">
                    {editMode ? <Edit2 className="text-[#ffb400]" /> : <Plus className="text-[#ffb400]" />} 
                    {editMode ? 'EDIT PROJECT' : 'NEW PROJECT DETAILS'}
                  </h3>
                  <form onSubmit={handleAddProject} className="grid md:grid-cols-2 gap-12">
                    <div className="flex flex-col gap-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Project Title</label>
                      <div className="relative">
                        <FileText className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          value={newProject.title}
                          onChange={e => setNewProject({...newProject, title: e.target.value})}
                          className="w-full bg-transparent border-b-2 border-slate-100 py-4 pl-8 outline-none focus:border-[#ffb400] transition-colors text-slate-900 font-bold" 
                          placeholder="e.g. SDK Solutions Web" 
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Category</label>
                      <div className="relative">
                        <Tag className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          value={newProject.cat}
                          onChange={e => setNewProject({...newProject, cat: e.target.value})}
                          className="w-full bg-transparent border-b-2 border-slate-100 py-4 pl-8 outline-none focus:border-[#ffb400] transition-colors text-slate-900 font-bold" 
                          placeholder="e.g. Ecommerce" 
                          required
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Description</label>
                      <textarea 
                        value={newProject.desc}
                        onChange={e => setNewProject({...newProject, desc: e.target.value})}
                        rows={3} 
                        className="w-full bg-transparent border-b-2 border-slate-100 py-4 outline-none focus:border-[#ffb400] transition-colors text-slate-900 font-bold resize-none" 
                        placeholder="Project background and features..." 
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Project Image</label>
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {newProject.img ? (
                            <img src={newProject.img} className="w-full h-full object-cover" alt="Preview" />
                          ) : (
                            <Upload className="text-slate-300" size={24} />
                          )}
                        </div>
                        <div className="flex-grow">
                          <input 
                            type="file" 
                            onChange={handleFileChange}
                            className="hidden" 
                            id="fileUpload"
                            accept="image/*"
                          />
                          <label 
                            htmlFor="fileUpload"
                            className="inline-flex items-center gap-3 px-6 py-3 bg-slate-100 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-200 transition-colors"
                          >
                            <ImageIcon size={16} /> Choose Image
                          </label>
                          <p className="text-[9px] text-slate-400 mt-2 uppercase font-bold">OR PASTE URL BELOW</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Live Project Link</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          value={newProject.link}
                          onChange={e => setNewProject({...newProject, link: e.target.value})}
                          className="w-full bg-transparent border-b-2 border-slate-100 py-4 pl-8 outline-none focus:border-[#ffb400] transition-colors text-slate-900 font-bold" 
                          placeholder="https://yourproject.com" 
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Technologies (Comma separated)</label>
                      <div className="relative">
                        <Globe className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          value={tagInput}
                          onChange={e => {
                            setTagInput(e.target.value)
                            setNewProject({...newProject, tags: e.target.value.split(',').map(s => s.trim())})
                          }}
                          className="w-full bg-transparent border-b-2 border-slate-100 py-4 pl-8 outline-none focus:border-[#ffb400] transition-colors text-slate-900 font-bold" 
                          placeholder="Next.js, Tailwind, Node.js" 
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 pt-4">
                      <button className="w-full bg-black text-white py-8 rounded-[24px] font-black uppercase tracking-[0.4em] text-[10px] hover:bg-[#ffb400] hover:text-black transition-all shadow-xl flex items-center justify-center gap-4 group">
                        {editMode ? 'Update Project' : 'Confirm & Publish Project'}
                        <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-[2px] bg-[#ffb400]"></div>
            <span className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Live Portfolio Items</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((proj, idx) => (
              <motion.div 
                layout
                key={idx}
                className="bg-white border border-slate-100 rounded-[32px] overflow-hidden group hover:shadow-2xl transition-all duration-500"
              >
                <div className="h-64 relative overflow-hidden">
                  <img src={proj.img} alt={proj.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/50">
                    <span className="text-black font-black text-[8px] uppercase tracking-widest leading-none">{proj.cat}</span>
                  </div>
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditClick(proj)}
                      className="p-3 bg-white text-black hover:bg-[#ffb400] rounded-xl shadow-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProject(proj.title)}
                      className="p-3 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-lg font-black text-slate-900 tracking-tighter italic uppercase mb-3 line-clamp-1">{proj.title}</h3>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-6">{proj.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {proj.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[8px] font-bold text-slate-400 uppercase tracking-widest">{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
