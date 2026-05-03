import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getSection, getCategoriesBySection } from '@/lib/queries'
import { CategoryIcon } from '@/components/CategoryIcon'
import { Navbar } from '@/components/Navbar'
import type { Category } from '@/types/database'

export const Route = createFileRoute('/$section')({
  component: SectionPage,
})

function SectionPage() {
  const { section: sectionSlug } = Route.useParams()
  const theme = sectionSlug === 'islam' ? 'islam' : 'gk'
  const isIslam = theme === 'islam'

  const { data: section, isLoading: sLoading } = useQuery({
    queryKey: ['section', sectionSlug],
    queryFn: () => getSection(sectionSlug).then(r => r.data),
  })

  const { data: categories, isLoading: cLoading } = useQuery({
    queryKey: ['categories', sectionSlug],
    queryFn: () => getCategoriesBySection(section!.id).then(r => r.data ?? []),
    enabled: !!section,
  })

  if (sLoading || cLoading) return <PageShell theme={theme}><Spinner /></PageShell>
  if (!section) throw notFound()

  const headerBg    = isIslam ? 'bg-islam-primary' : 'bg-gk-primary'
  const surface     = isIslam ? 'bg-islam-surface' : 'bg-gk-surface'
  const border      = isIslam ? 'border-islam-border' : 'border-gk-border'
  const hoverBorder = isIslam ? 'hover:border-islam-accent' : 'hover:border-gk-primary'
  const iconHoverBg = isIslam ? 'group-hover:bg-islam-primary group-hover:border-islam-primary' : 'group-hover:bg-gk-primary group-hover:border-gk-primary'
  const ctaColor    = isIslam ? 'text-islam-accent' : 'text-gk-primary'
  const subtitle    = isIslam
    ? 'Structured entries on Islamic obligations, rituals, and rulings.'
    : 'Clear reference entries on science, medicine, and applied disciplines.'

  return (
    <div className={`min-h-screen ${surface}`}>
      <Navbar theme={theme} />

      <div className={headerBg}>
        <div className="max-w-5xl mx-auto px-6 py-14">
          <p className={`text-xs font-medium uppercase tracking-widest mb-3 ${isIslam ? 'text-islam-accent' : 'text-blue-300'}`}>Section</p>
          <h1 className="font-[family-name:var(--font-lora)] text-5xl md:text-6xl font-bold text-white leading-tight">
            {section.name}
          </h1>
          {isIslam && (
            <p className="font-[family-name:var(--font-amiri)] text-2xl text-islam-accent mt-2" dir="rtl">علوم إسلامية</p>
          )}
          <p className="text-base mt-4 max-w-xl leading-relaxed text-white/80">{subtitle}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-stone-500">
          <Link to="/" className={`hover:${isIslam ? 'text-islam-primary' : 'text-gk-primary'} transition-colors`}>Home</Link>
          <Chevron />
          <span className={`font-medium ${isIslam ? 'text-islam-primary' : 'text-gk-primary'}`}>{section.name}</span>
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-6 pb-20">
        <p className="text-stone-500 text-sm mb-8">{categories?.length ?? 0} categories</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories?.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              sectionSlug={sectionSlug}
              border={border}
              hoverBorder={hoverBorder}
              surface={surface}
              iconHoverBg={iconHoverBg}
              ctaColor={ctaColor}
              isIslam={isIslam}
            />
          ))}
        </div>
      </main>

      <footer className={`border-t py-8 ${border}`}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="text-stone-400 text-sm">Ma'rifah Hub · Free public reference</span>
        </div>
      </footer>
    </div>
  )
}

type CategoryCardProps = {
  category: Category
  sectionSlug: string
  border: string
  hoverBorder: string
  surface: string
  iconHoverBg: string
  ctaColor: string
  isIslam: boolean
}

function CategoryCard({ category, sectionSlug, border, hoverBorder, surface, iconHoverBg, ctaColor, isIslam }: CategoryCardProps) {
  const primaryColor = isIslam ? 'text-islam-primary' : 'text-gk-primary'
  return (
    <Link
      to="/$section/$category"
      params={{ section: sectionSlug, category: category.slug }}
      className="group cursor-pointer"
    >
      <div className={`bg-white border-2 rounded-2xl p-7 h-full flex flex-col hover:shadow-md transition-all duration-200 ${border} ${hoverBorder}`}>
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 transition-colors duration-200 ${surface} ${border} ${iconHoverBg}`}>
          <CategoryIcon name={category.icon_name} className={`w-6 h-6 ${primaryColor} group-hover:text-white transition-colors duration-200`} />
        </div>
        <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-stone-800 mb-2">{category.name}</h3>
        <div className={`flex items-center gap-1 mt-auto pt-5 text-xs font-medium group-hover:gap-2 transition-all duration-200 ${ctaColor}`}>
          <span>View entries</span>
          <Chevron />
        </div>
      </div>
    </Link>
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
  return <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
}

function Chevron() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}
