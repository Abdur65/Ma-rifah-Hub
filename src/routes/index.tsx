import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { MdOutlineMosque } from 'react-icons/md'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) void navigate({ to: '/search', search: { q: query.trim() } })
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">

        <h1 className="font-[family-name:var(--font-lora)] text-5xl md:text-6xl font-bold text-stone-900 tracking-tight leading-tight">
          Ma'rifah Hub
        </h1>
        <p className="font-[family-name:var(--font-amiri)] text-3xl text-stone-500 mt-2" dir="rtl">
          معرفة هب
        </p>
        <p className="text-stone-500 text-lg mt-6 mb-12 max-w-xl mx-auto leading-relaxed">
          A curated reference for Islamic knowledge and general learning.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-20">
          <div className="flex items-center bg-white border-2 border-stone-300 rounded-xl shadow-sm focus-within:border-stone-500 transition-colors">
            <svg className="ml-4 w-5 h-5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search entries across all topics…"
              className="w-full px-4 py-4 bg-transparent text-stone-800 placeholder-stone-400 text-base focus:outline-none"
            />
          </div>
        </form>

        {/* Section cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <SectionCard
            to="/islam"
            title="Islam"
            subtitle="Fasting, Prayer, Inheritance, Hajj, Umrah — structured entries drawn from primary sources."
            theme="islam"
            icon={<MdOutlineMosque className='text-white w-7 h-7'/>}
          />
          <SectionCard
            to="/general-knowledge"
            title="General Knowledge"
            subtitle="Hematology, Electrical Fundamentals, Nutritional Science — clear reference entries for study."
            theme="gk"
            icon={<BookIcon />}
          />
        </div>
      </main>

      <footer className="border-t border-stone-200 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="text-stone-400 text-sm">Ma'rifah Hub · Free public reference · No accounts required</span>
        </div>
      </footer>
    </div>
  )
}

type SectionCardProps = {
  to: string
  title: string
  subtitle: string
  theme: 'islam' | 'gk'
  icon: React.ReactNode
}

function SectionCard({ to, title, subtitle, theme, icon }: SectionCardProps) {
  const navigate = useNavigate()
  const isIslam = theme === 'islam'

  const surface  = isIslam ? 'bg-islam-surface border-islam-border hover:border-islam-accent' : 'bg-gk-surface border-gk-border hover:border-gk-primary'
  const iconBg   = isIslam ? 'bg-islam-primary' : 'bg-gk-primary'
  const heading  = isIslam ? 'text-islam-primary' : 'text-gk-primary'
  const cta      = isIslam ? 'text-islam-accent' : 'text-gk-accent'

  return (
    <button
      onClick={() => void navigate({ to })}
      className={`group cursor-pointer w-full border-2 rounded-2xl p-10 flex flex-col items-start text-left hover:shadow-lg transition-all duration-200 ${surface}`}
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200 ${iconBg}`}>
        {icon}
      </div>
      <h2 className={`font-[family-name:var(--font-lora)] text-3xl font-bold mb-3 ${heading}`}>{title}</h2>
      <p className="text-stone-600 text-base leading-relaxed mb-6 flex-1">{subtitle}</p>
      <div className={`flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all duration-200 ${cta}`}>
        <span>Browse categories</span>
        <ChevronRight />
      </div>
    </button>
  )
}

function MoonIcon() {
  return (
    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}
