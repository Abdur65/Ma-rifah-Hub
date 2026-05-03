import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getAllSections, getAllCategories, createCategory, deleteCategory } from '@/lib/adminQueries'
import { CategoryIcon } from '@/components/CategoryIcon'
import * as AlertDialog from '@radix-ui/react-alert-dialog'

export const Route = createFileRoute('/himayah/categories')({
  component: CategoriesPage,
})

const AVAILABLE_ICONS = [
  'GiPrayer',
  'GiConcentricCrescents',
  'GiSamaraMosque',
  'GiBlood',
  'GiWheat',
  'FaScaleBalanced',
  'MdElectricBolt',
]

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function CategoriesPage() {
  const queryClient = useQueryClient()

  const { data: sections = [] } = useQuery({
    queryKey: ['admin-sections'],
    queryFn: () => getAllSections().then(r => r.data ?? []),
  })

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => getAllCategories().then(r => r.data ?? []),
  })

  const [activeSection, setActiveSection] = useState<number | null>(null)
  const activeSectionId = activeSection ?? sections[0]?.id ?? null

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [icon, setIcon] = useState(AVAILABLE_ICONS[0])
  const [formError, setFormError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  function handleNameChange(val: string) {
    setName(val)
    if (!slugTouched) setSlug(slugify(val))
  }

  const createMutation = useMutation({
    mutationFn: () => {
      if (!activeSectionId) throw new Error('No section selected')
      return createCategory({ section_id: activeSectionId, name: name.trim(), slug: slug.trim(), icon_name: icon })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
      setName('')
      setSlug('')
      setSlugTouched(false)
      setIcon(AVAILABLE_ICONS[0])
      setFormError('')
    },
    onError: (err: Error) => {
      setFormError(err.message || 'Failed to create category')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
      setDeletingId(null)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setFormError('Name is required')
    if (!slug.trim()) return setFormError('Slug is required')
    const exists = sectionCategories.some(c => c.slug === slug.trim())
    if (exists) return setFormError('A category with this slug already exists in this section')
    createMutation.mutate()
  }

  const activeSection_ = sections.find(s => s.id === activeSectionId)
  const sectionCategories = categories.filter(
    (c) => (c.section as { id: number } | null)?.id === activeSectionId
  )

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-lora)] text-3xl font-bold text-slate-900">Categories</h1>
        <p className="text-slate-500 text-sm mt-1">Manage categories for each section</p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 mb-8">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeSectionId === section.id
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>

      {/* Existing categories */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-700">
            {activeSection_?.name ?? '—'} · {sectionCategories.length} {sectionCategories.length === 1 ? 'category' : 'categories'}
          </h2>
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && sectionCategories.length === 0 && (
          <p className="text-slate-400 text-sm px-6 py-8">No categories yet for this section.</p>
        )}

        {!isLoading && sectionCategories.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {sectionCategories.map(cat => (
              <li key={cat.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <CategoryIcon name={cat.icon_name} className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{cat.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{cat.slug}</p>
                </div>

                <AlertDialog.Root open={deletingId === cat.id} onOpenChange={open => !open && setDeletingId(null)}>
                  <AlertDialog.Trigger asChild>
                    <button
                      onClick={() => setDeletingId(cat.id)}
                      className="text-red-400 hover:text-red-600 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-red-50 text-xs font-medium shrink-0"
                    >
                      Delete
                    </button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Portal>
                    <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                    <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                      <AlertDialog.Title className="font-[family-name:var(--font-lora)] text-lg font-semibold text-slate-900 mb-2">
                        Delete this category?
                      </AlertDialog.Title>
                      <AlertDialog.Description className="text-slate-500 text-sm mb-6">
                        "<span className="font-medium text-slate-700">{cat.name}</span>" and all its entries will be permanently deleted. This cannot be undone.
                      </AlertDialog.Description>
                      <div className="flex gap-3 justify-end">
                        <AlertDialog.Cancel className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors cursor-pointer rounded-xl hover:bg-slate-100">
                          Cancel
                        </AlertDialog.Cancel>
                        <AlertDialog.Action
                          onClick={() => deleteMutation.mutate(cat.id)}
                          className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer font-medium"
                        >
                          {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                        </AlertDialog.Action>
                      </div>
                    </AlertDialog.Content>
                  </AlertDialog.Portal>
                </AlertDialog.Root>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* New category form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-[family-name:var(--font-lora)] text-lg font-semibold text-slate-900 mb-5">
          New category in {activeSection_?.name ?? '—'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Fasting"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugTouched(true) }}
              placeholder="e.g. fasting"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Icon</label>
            <div className="grid grid-cols-7 gap-2">
              {AVAILABLE_ICONS.map(iconName => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  title={iconName}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    icon === iconName
                      ? 'border-slate-800 bg-slate-800 text-white'
                      : 'border-slate-200 hover:border-slate-400 text-slate-600'
                  }`}
                >
                  <CategoryIcon name={iconName} className="w-5 h-5" />
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Selected: {icon}</p>
          </div>

          {formError && (
            <p className="text-sm text-red-500">{formError}</p>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            {createMutation.isPending ? 'Creating…' : 'Create category'}
          </button>
        </form>
      </div>
    </main>
  )
}
