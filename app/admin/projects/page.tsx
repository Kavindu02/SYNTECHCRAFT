'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, LogOut, LayoutDashboard, FolderKanban, Globe, Tag, Image as ImageIcon, FileText, ChevronRight, Edit2, Link as LinkIcon, Upload, X } from 'lucide-react'

interface Project {
  _id?: string;
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

const MAX_IMAGE_DIMENSION = 1400
const OUTPUT_IMAGE_QUALITY = 0.74
const DEFAULT_PROJECT_IMAGE_PATH = '/images/projects/default.png'

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Failed to read image file.'))
    }

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'))
    }

    reader.readAsDataURL(file)
  })
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image for optimization.'))
    image.src = src
  })
}

async function optimizeImageForStorage(file: File): Promise<string> {
  const originalDataUrl = await readFileAsDataUrl(file)
  const image = await loadImageElement(originalDataUrl)

  const originalWidth = image.width || 1
  const originalHeight = image.height || 1
  const longestEdge = Math.max(originalWidth, originalHeight)
  const scale = longestEdge > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / longestEdge : 1

  const targetWidth = Math.max(1, Math.round(originalWidth * scale))
  const targetHeight = Math.max(1, Math.round(originalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const context = canvas.getContext('2d')
  if (!context) {
    return originalDataUrl
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight)

  try {
    return canvas.toDataURL('image/webp', OUTPUT_IMAGE_QUALITY)
  } catch {
    return originalDataUrl
  }
}

function asProjectsArray(value: unknown): Project[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item, index) => {
    const candidate = item as Partial<Project>

    return {
      _id: typeof candidate._id === 'string' ? candidate._id : '',
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

function extractProject(value: unknown): Project | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const [project] = asProjectsArray([value])
  return project ?? null
}

function getProjectIdentityQuery(project: Project) {
  const mongoId = typeof project._id === 'string' ? project._id.trim() : ''
  if (mongoId.length > 0) {
    return `_id=${encodeURIComponent(mongoId)}`
  }

  if (typeof project.id === 'number' && Number.isInteger(project.id) && project.id > 0) {
    return `id=${project.id}`
  }

  return ''
}

function hasSameProjectIdentity(left: Project, right: Project) {
  const leftMongoId = typeof left._id === 'string' ? left._id.trim() : ''
  const rightMongoId = typeof right._id === 'string' ? right._id.trim() : ''

  if (leftMongoId && rightMongoId) {
    return leftMongoId === rightMongoId
  }

  if (typeof left.id === 'number' && typeof right.id === 'number') {
    return left.id === right.id
  }

  return false
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isProjectsLoading, setIsProjectsLoading] = useState(true)
  const [isEditPreparing, setIsEditPreparing] = useState(false)
  const [fileInputResetKey, setFileInputResetKey] = useState(0)
  const [originalEditImage, setOriginalEditImage] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [newProject, setNewProject] = useState<Project>({
    title: '',
    cat: '',
    desc: '',
    tags: [],
    img: '',
    link: '',
    showOnHome: false,
    homeSelectionOrder: null,
  })
  const [tagInput, setTagInput] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    setIsProjectsLoading(true)
    try {
      const res = await fetch('/api/projects?lite=1', {
        cache: 'no-store',
        signal: controller.signal,
      })
      if (!res.ok) return
      const data = await res.json()
      const projectsData = extractProjects(data)
      setProjects(projectsData)
    } catch {
    } finally {
      clearTimeout(timeoutId)
      setIsProjectsLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) {
      setFileInputResetKey((current) => current + 1)
      return
    }

    try {
      const optimizedImage = await optimizeImageForStorage(file)
      setNewProject((current) => ({ ...current, img: optimizedImage }))
    } catch {
    } finally {
      setFileInputResetKey((current) => current + 1)
    }
  }

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = '/api/projects'
      const method = editMode ? 'PUT' : 'POST'
      const projectDraft: Project = {
        ...newProject,
        tags: [...newProject.tags],
      }
      const body: Record<string, unknown> = { ...projectDraft }

      if (editMode && projectDraft.img === originalEditImage) {
        delete body.img
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (res.ok) {
        if (editMode) {
          setProjects((current) =>
            current.map((project) =>
              hasSameProjectIdentity(project, projectDraft)
                ? {
                    ...project,
                    ...projectDraft,
                    img: projectDraft.img || project.img || DEFAULT_PROJECT_IMAGE_PATH,
                  }
                : project
            )
          )
        } else {
          const createdProject: Project = {
            ...projectDraft,
            _id: typeof data?.project?._id === 'string' ? data.project._id : projectDraft._id,
            id: typeof data?.project?.id === 'number' ? data.project.id : projectDraft.id,
            img: projectDraft.img || DEFAULT_PROJECT_IMAGE_PATH,
          }

          setProjects((current) => [createdProject, ...current])
        }

        resetForm()
      } else {
        alert(data.error || 'Failed to save project')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred while saving the project')
    }
  }

  const resetForm = () => {
    setNewProject({ _id: '', title: '', cat: '', desc: '', tags: [], img: '', link: '', showOnHome: false, homeSelectionOrder: null })
    setOriginalEditImage('')
    setTagInput('')
    setShowAddForm(false)
    setEditMode(false)
  }

  const handleEditClick = async (proj: Project) => {
    const identityQuery = getProjectIdentityQuery(proj)

    if (!identityQuery) {
      alert('Unable to identify this project for editing.')
      return
    }

    setIsEditPreparing(true)

    let projectForEdit: Project | null = null

    try {
      const res = await fetch(`/api/projects?${identityQuery}`, { cache: 'no-store' })
      if (!res.ok) {
        alert('Failed to load project details. Please try again.')
        return
      }

      const data = await res.json()
      projectForEdit = extractProject(data)

      if (!projectForEdit) {
        alert('Failed to load project details. Please try again.')
        return
      }
    } catch {
      alert('Failed to load project details. Please try again.')
      return
    } finally {
      setIsEditPreparing(false)
    }

    setNewProject(projectForEdit)
  setOriginalEditImage(projectForEdit.img || '')
    setTagInput(projectForEdit.tags.join(', '))
    setEditMode(true)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteProject = async (project: Project) => {
    if (!project._id && !project.id) return
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const res = await fetch('/api/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: project._id, id: project.id }),
      })

      const data = await res.json()

      if (res.ok) {
        setProjects((current) =>
          current.filter((item) => !hasSameProjectIdentity(item, project))
        )
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
      <nav className="fixed bottom-0 left-0 right-0 h-16 md:h-full md:w-24 md:left-0 md:right-auto md:top-0 bg-black flex md:flex-col items-center justify-around md:justify-start md:py-10 gap-4 md:gap-12 z-50 px-4 md:px-0">
        <div className="hidden md:block bg-[#ffb400] p-2 rounded-xl">
          <img src="/logo.png" alt="Syntechcraft Logo" className="w-8 h-8 object-contain" />
        </div>
        <div className="flex md:flex-col gap-4 md:gap-8 md:flex-grow items-center">
          <Link href="/admin/dashboard" className="text-white/70 p-2.5 md:p-4 rounded-xl md:rounded-2xl hover:bg-white/10 transition-colors"><LayoutDashboard size={20} className="md:w-6 md:h-6" /></Link>
          <Link href="/admin/projects" className="text-[#ffb400] p-2.5 md:p-4 rounded-xl md:rounded-2xl bg-white/10 shadow-lg"><FolderKanban size={20} className="md:w-6 md:h-6" /></Link>
        </div>
        <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors md:mb-4 p-2.5 md:p-0"><LogOut size={20} className="md:w-6 md:h-6" /></button>
      </nav>

      <main className="pb-20 md:pb-0 md:pl-24">
        <header className="bg-white border-b border-slate-100 p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4 sticky top-0 z-40">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic uppercase"><span className="text-[#ffb400] not-italic">Projects</span></h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">Manage Portfolio Project Content</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-black text-white px-5 md:px-8 py-3 md:py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#ffb400] hover:text-black transition-all flex items-center justify-center gap-3 w-full sm:w-auto"
          >
            {showAddForm ? 'Close Form' : <><Plus size={16} /> Add New Project</>}
          </button>
        </header>

        <div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto">
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-start md:items-center justify-center bg-black/60 p-3 md:p-6"
                onClick={resetForm}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 12 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-slate-100 rounded-2xl md:rounded-[32px] p-4 sm:p-6 md:p-10 shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-end mb-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      aria-label="Close form"
                      className="p-2 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic mb-6 flex items-center gap-3">
                    {editMode ? <Edit2 className="text-[#ffb400]" /> : <Plus className="text-[#ffb400]" />}
                    {editMode ? 'EDIT PROJECT' : 'NEW PROJECT DETAILS'}
                  </h3>
                  <form onSubmit={handleAddProject} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Project Title</label>
                      <div className="relative">
                        <FileText className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                          value={newProject.title}
                          onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                          className="w-full bg-transparent border-b-2 border-slate-100 py-3 pl-8 outline-none focus:border-[#ffb400] transition-colors text-slate-900 font-bold"
                          placeholder="e.g. SDK Solutions Web"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Category</label>
                      <div className="relative">
                        <Tag className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                          value={newProject.cat}
                          onChange={e => setNewProject({ ...newProject, cat: e.target.value })}
                          className="w-full bg-transparent border-b-2 border-slate-100 py-3 pl-8 outline-none focus:border-[#ffb400] transition-colors text-slate-900 font-bold"
                          placeholder="e.g. Ecommerce"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Live Project Link</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                          value={newProject.link}
                          onChange={e => setNewProject({ ...newProject, link: e.target.value })}
                          className="w-full bg-transparent border-b-2 border-slate-100 py-3 pl-8 outline-none focus:border-[#ffb400] transition-colors text-slate-900 font-bold"
                          placeholder="https://yourproject.com"
                        />
                      </div>
                    </div>
                    <div className="lg:col-span-3 flex flex-col gap-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Description</label>
                      <textarea
                        value={newProject.desc}
                        onChange={e => setNewProject({ ...newProject, desc: e.target.value })}
                        rows={2}
                        className="w-full bg-transparent border-b-2 border-slate-100 py-3 outline-none focus:border-[#ffb400] transition-colors text-slate-900 font-bold resize-none"
                        placeholder="Project background and features..."
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Project Image</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {newProject.img ? (
                            <img src={newProject.img} className="w-full h-full object-cover" alt="Preview" />
                          ) : (
                            <Upload className="text-slate-300" size={18} />
                          )}
                        </div>
                        <div className="flex-grow">
                          <input
                            key={fileInputResetKey}
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            id="fileUpload"
                            accept="image/*"
                          />
                          <label
                            htmlFor="fileUpload"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-200 transition-colors"
                          >
                            <ImageIcon size={16} /> Choose Image
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2 lg:col-span-2 flex flex-col gap-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Technologies (Comma separated)</label>
                      <div className="relative">
                        <Globe className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                          value={tagInput}
                          onChange={e => {
                            setTagInput(e.target.value)
                            setNewProject({ ...newProject, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })
                          }}
                          className="w-full bg-transparent border-b-2 border-slate-100 py-3 pl-8 outline-none focus:border-[#ffb400] transition-colors text-slate-900 font-bold"
                          placeholder="Next.js, Tailwind, Node.js"
                        />
                      </div>
                    </div>
                    <div className="lg:col-span-3 pt-1">
                      <button className="w-full bg-black text-white py-5 rounded-[20px] font-black uppercase tracking-[0.35em] text-[10px] hover:bg-[#ffb400] hover:text-black transition-all shadow-xl flex items-center justify-center gap-3 group">
                        {editMode ? 'Update Project' : 'Confirm & Publish Project'}
                        <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
            {projects.length === 0 ? (
              <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-slate-100 bg-white p-8 text-center">
                <p className="text-sm font-bold text-slate-500">
                  {isProjectsLoading ? 'Loading projects...' : 'No projects found.'}
                </p>
              </div>
            ) : projects.map((proj, idx) => (
              <motion.div
                layout
                key={proj._id || proj.id || idx}
                className="bg-white border border-slate-100 rounded-2xl md:rounded-[32px] overflow-hidden group hover:shadow-2xl transition-all duration-500"
              >
                <div className="h-52 md:h-64 relative overflow-hidden">
                  <img src={proj.img || DEFAULT_PROJECT_IMAGE_PATH} alt={proj.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/50">
                    <span className="text-black font-black text-[8px] uppercase tracking-widest leading-none">{proj.cat}</span>
                  </div>
                  <div className="absolute top-4 md:top-6 right-4 md:right-6 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditClick(proj)}
                      disabled={isEditPreparing}
                      className="p-2.5 md:p-3 bg-white text-black hover:bg-[#ffb400] rounded-xl shadow-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj)}
                      className="p-2.5 md:p-3 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4 md:p-8">
                  <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tighter italic uppercase mb-2 md:mb-3 line-clamp-1">{proj.title}</h3>
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
