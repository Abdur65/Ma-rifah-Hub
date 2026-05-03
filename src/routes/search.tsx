import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { searchEntries } from '@/lib/queries'
import { useDebounce } from '@/hooks/useDebounce'
import { Navbar } from '@/components/Navbar'
import DOMPurify from 'dompurify'

type SearchSearch = { q?: string }

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>): SearchSearch => ({
    q: typeof search.q === 'string' ? search.q : undefined,
  }),
  component: SearchPage,
})

function SearchPage() {
  const { q } = Route.useSearch()
  const navigate = useNavigate()
  const [query, setQuery] = useState(q ?? '')
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery.trim()) {
      void navigate({ to: '/search', search: { q: debouncedQuery.trim() }, replace: true })
    }
  }, [debouncedQuery, navigate])

  const { data: results, isLoading, isFetching } = useQuery({
    queryKey: ['search', q],
    queryFn: () => searchEntries(q ?? '').then(r => r.data ?? []),
    enabled: (q ?? '').trim().length > 1,
  })

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Search input */}
        <div className="flex items-center bg-white border-2 border-stone-300 rounded-xl focus-within:border-stone-500 transition-colors mb-8">
          <svg className="ml-4 w-5 h-5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search entries across all topics…"
            className="w-full px-4 py-4 bg-transparent text-stone-800 placeholder-stone-400 text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); void navigate({ to: '/search', search: {} }) }}
              className="mr-4 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Results header */}
        {q && !isLoading && (
          <p className="text-sm text-stone-500 mb-6">
            {results?.length === 0
              ? <>No results for "<span className="text-stone-800">{q}</span>"</>
              : <><span className="font-semibold text-stone-800">{results?.length} result{results?.length !== 1 ? 's' : ''}</span> for "<span className="text-stone-800">{q}</span>"</>
            }
          </p>
        )}

        {/* Loading */}
        {(isLoading || isFetching) && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Results */}
        {!isLoading && results && results.length > 0 && (
          <div className="space-y-4">
            {results.map(entry => {
              const cat = entry.category as { id: number; name: string; slug: string; section: { id: number; name: string; slug: string } } | null
              if (!cat) return null
              const isIslam = cat.section.slug === 'islam'
              const badgeBg  = isIslam ? 'bg-islam-surface text-islam-primary' : 'bg-gk-surface text-gk-primary'
              const dotColor = isIslam ? 'bg-islam-primary' : 'bg-gk-primary'
              const hoverTitle = isIslam ? 'group-hover:text-islam-primary' : 'group-hover:text-gk-primary'

              const snippet = DOMPurify.sanitize(entry.body, { ALLOWED_TAGS: [] }).slice(0, 200)

              return (
                <Link
                  key={entry.id}
                  to="/$section/$category/$entry"
                  params={{ section: cat.section.slug, category: cat.slug, entry: entry.slug }}
                  className="group block bg-white border border-stone-200 rounded-2xl px-7 py-6 hover:border-stone-300 hover:shadow-sm transition-all duration-150"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeBg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full inline-block ${dotColor}`} />
                      {cat.section.name} · {cat.name}
                    </span>
                  </div>
                  <h3 className={`font-[family-name:var(--font-lora)] text-xl font-semibold text-stone-900 mb-2 transition-colors duration-150 ${hoverTitle}`}>
                    {entry.heading}
                  </h3>
                  {snippet && (
                    <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">{snippet}…</p>
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {/* Empty state — no query yet */}
        {!q && (
          <div className="text-center py-20">
            <p className="text-stone-400 text-sm">Type to search across all entries.</p>
          </div>
        )}
      </main>
    </div>
  )
}
