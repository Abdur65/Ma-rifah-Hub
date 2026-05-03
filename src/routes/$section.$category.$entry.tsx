import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getSection, getCategory, getEntry } from '@/lib/queries'
import { EntryCard } from '@/components/EntryCard'
import { Navbar } from '@/components/Navbar'

export const Route = createFileRoute('/$section/$category/$entry')({
  component: EntryPage,
})

function EntryPage() {
  const { section: sectionSlug, category: categorySlug, entry: entrySlug } = Route.useParams()
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
      return getCategory(sec.data.id, categorySlug).then(r => r.data ?? null)
    },
  })

  const { data: entry, isLoading } = useQuery({
    queryKey: ['entry', category?.id, entrySlug],
    queryFn: () => getEntry(category!.id, entrySlug).then(r => r.data ?? null),
    enabled: !!category,
  })

  if (!isLoading && entry === null) throw notFound()

  const surface = isIslam ? 'bg-islam-surface' : 'bg-gk-surface'
  const border  = isIslam ? 'border-islam-border' : 'border-gk-border'
  const primary = isIslam ? 'text-islam-primary' : 'text-gk-primary'

  return (
    <div className={`min-h-screen ${surface}`}>
      <Navbar theme={theme} />

      <div className="max-w-3xl mx-auto px-6 pt-5 pb-2">
        <nav className="flex items-center gap-2 text-sm text-stone-500 flex-wrap">
          <Link to="/" className={`hover:${primary} transition-colors`}>Home</Link>
          <Chevron />
          <Link to="/$section" params={{ section: sectionSlug }} className={`hover:${primary} transition-colors`}>{section?.name}</Link>
          <Chevron />
          <Link to="/$section/$category" params={{ section: sectionSlug, category: categorySlug }} className={`hover:${primary} transition-colors`}>{category?.name}</Link>
          <Chevron />
          <span className={`font-medium ${primary} line-clamp-1`}>{entry?.heading}</span>
        </nav>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8 pb-24">
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
          </div>
        )}
        {entry && <EntryCard entry={entry} theme={theme} />}
      </main>

      <footer className={`border-t py-8 ${border}`}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-stone-400 text-sm">Ma'rifah Hub · Free public reference</span>
        </div>
      </footer>
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
