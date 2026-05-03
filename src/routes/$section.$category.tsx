import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getSection, getCategory, getEntriesByCategory } from '@/lib/queries'
import { CategoryIcon } from '@/components/CategoryIcon'
import { EntryCard } from '@/components/EntryCard'
import { Navbar } from '@/components/Navbar'

export const Route = createFileRoute('/$section/$category')({
  component: CategoryPage,
})

function CategoryPage() {
  const { section: sectionSlug, category: categorySlug } = Route.useParams()
  const theme = sectionSlug === 'islam' ? 'islam' : 'gk'
  const isIslam = theme === 'islam'

  const { data: section } = useQuery({
    queryKey: ['section', sectionSlug],
    queryFn: () => getSection(sectionSlug).then(r => r.data),
  })

  const { data: category } = useQuery({
    queryKey: ['category', sectionSlug, categorySlug],
    queryFn: async () => {
      const sec = await getSection(sectionSlug)
      if (!sec.data) return null
      const res = await getCategory(sec.data.id, categorySlug)
      return res.data ?? null
    },
  })

  const { data: entries, isLoading } = useQuery({
    queryKey: ['entries', category?.id],
    queryFn: () => getEntriesByCategory(category!.id).then(r => r.data ?? []),
    enabled: !!category,
  })

  if (!section || !category) {
    if (!isLoading && section !== undefined && category !== undefined) throw notFound()
    return <PageShell theme={theme}><Spinner /></PageShell>
  }

  const surface = isIslam ? 'bg-islam-surface' : 'bg-gk-surface'
  const border  = isIslam ? 'border-islam-border' : 'border-gk-border'
  const primary = isIslam ? 'text-islam-primary' : 'text-gk-primary'
  const iconBg  = isIslam ? 'bg-islam-primary' : 'bg-gk-primary'

  return (
    <div className={`min-h-screen ${surface}`}>
      <Navbar theme={theme} />

      <div className="max-w-3xl mx-auto px-6 pt-5 pb-2">
        <nav className="flex items-center gap-2 text-sm text-stone-500 flex-wrap">
          <Link to="/" className={`hover:${primary} transition-colors`}>Home</Link>
          <Chevron />
          <Link to="/$section" params={{ section: sectionSlug }} className={`hover:${primary} transition-colors`}>{section.name}</Link>
          <Chevron />
          <span className={`font-medium ${primary}`}>{category.name}</span>
        </nav>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-6 pb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <CategoryIcon name={category.icon_name} className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-0.5">{section.name} · Category</p>
            <h1 className={`font-[family-name:var(--font-lora)] text-4xl font-bold text-stone-900`}>{category.name}</h1>
          </div>
        </div>
        <p className="text-stone-500 text-sm mt-4">
          {isLoading ? 'Loading…' : `${entries?.length ?? 0} ${entries?.length === 1 ? 'entry' : 'entries'}`}
        </p>
      </div>

      <main className="max-w-3xl mx-auto px-6 pb-24 space-y-6">
        {isLoading && <Spinner />}
        {!isLoading && entries?.length === 0 && (
          <p className="text-stone-400 text-sm">No entries yet in this category.</p>
        )}
        {entries?.map(entry => (
          <EntryCard
            key={entry.id}
            entry={entry}
            theme={theme}
            linkHref={`/${sectionSlug}/${categorySlug}/${entry.slug}`}
          />
        ))}
      </main>

      <footer className={`border-t py-8 ${border}`}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-stone-400 text-sm">Ma'rifah Hub · Free public reference</span>
        </div>
      </footer>
    </div>
  )
}

function PageShell({ theme, children }: { theme: 'islam' | 'gk'; children: React.ReactNode }) {
  return (
    <div className={`min-h-screen ${theme === 'islam' ? 'bg-islam-surface' : 'bg-gk-surface'}`}>
      <Navbar theme={theme} />
      <div className="flex items-center justify-center h-64">{children}</div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
    </div>
  )
}

function Chevron() {
  return (
    <svg className="w-3 h-3 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}
