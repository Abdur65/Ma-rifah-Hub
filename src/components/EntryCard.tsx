import DOMPurify from 'dompurify'
import type { Entry } from '@/types/database'

type Props = {
  entry: Entry
  theme: 'islam' | 'gk'
  linkHref?: string
}

export function EntryCard({ entry, theme, linkHref }: Props) {
  const accentColor = theme === 'islam' ? 'text-islam-accent' : 'text-gk-accent'
  const surfaceClass = theme === 'islam'
    ? 'bg-islam-surface border-islam-border'
    : 'bg-gk-surface border-gk-border'
  const borderClass = theme === 'islam' ? 'border-islam-border' : 'border-gk-border'
  const headingColor = theme === 'islam' ? 'text-islam-primary' : 'text-gk-primary'

  const sanitizedBody = DOMPurify.sanitize(entry.body)

  return (
    <article id={entry.slug} className={`bg-white border rounded-2xl overflow-hidden scroll-mt-24 ${borderClass}`}>
      <div className={`border-b px-8 py-5 flex items-start justify-between gap-4 ${borderClass}`}>
        <h2 className={`font-[family-name:var(--font-lora)] text-2xl font-semibold leading-snug ${headingColor}`}>
          {entry.heading}
        </h2>
        {linkHref && (
          <a
            href={linkHref}
            className="shrink-0 mt-1 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
            title="Copy link to this entry"
          >
            <LinkIcon />
          </a>
        )}
      </div>

      <div className="px-8 py-7 space-y-6">
        {entry.arabic_text && (
          <div className={`border rounded-xl px-6 py-5 ${surfaceClass}`}>
            <p className="arabic text-stone-800">{entry.arabic_text}</p>
          </div>
        )}

        <div
          className="tiptap-content text-stone-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizedBody }}
        />

        {entry.reference && (
          <div className={`flex items-start gap-3 pt-4 border-t border-stone-100`}>
            <BookIcon className={`w-4 h-4 mt-0.5 shrink-0 ${accentColor}`} />
            {entry.ref_is_link ? (
              <a
                href={entry.reference}
                target="_blank"
                rel="noopener noreferrer"
                className="font-inter text-sm text-stone-500 italic hover:underline min-w-0 break-words"
              >
                {entry.reference}
              </a>
            ) : (
              <span className="font-inter text-sm text-stone-500 italic min-w-0 break-words">{entry.reference}</span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}
