import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { MdOutlineMosque } from "react-icons/md";
import { searchEntries } from "@/lib/queries";
import { useDebounce } from "@/hooks/useDebounce";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 200);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["search-home", debouncedQuery],
    queryFn: () => searchEntries(debouncedQuery).then((r) => r.data ?? []),
    enabled: debouncedQuery.trim().length > 0,
  });

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      void navigate({ to: "/search", search: { q: query.trim() } });
    }
  }

  function handleSelect(
    sectionSlug: string,
    categorySlug: string,
    entrySlug: string,
  ) {
    setOpen(false);
    setQuery("");
    void navigate({
      to: "/$section/$category/$entry",
      params: {
        section: sectionSlug,
        category: categorySlug,
        entry: entrySlug,
      },
    });
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="font-[family-name:var(--font-lora)] text-5xl md:text-6xl font-bold text-stone-900 tracking-tight leading-tight">
          Ma'rifah Hub
        </h1>
        <p
          className="font-[family-name:var(--font-amiri)] text-3xl text-stone-500 mt-2"
          dir="rtl"
        >
          معرفة هب
        </p>
        <p className="text-stone-500 text-lg mt-6 mb-12 max-w-xl mx-auto leading-relaxed">
          A curated reference for Islamic knowledge and general learning.
        </p>

        {/* Search */}
        <div ref={wrapRef} className="relative max-w-xl mx-auto mb-20">
          <form onSubmit={handleSearch}>
            <div className="flex items-center bg-white border-2 border-stone-300 rounded-xl shadow-sm focus-within:border-stone-500 transition-colors">
              <svg
                className="ml-4 w-5 h-5 text-stone-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => query.length > 0 && setOpen(true)}
                placeholder="Search entries across all topics…"
                className="w-full px-4 py-4 bg-transparent text-stone-800 placeholder-stone-400 text-base focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setOpen(false);
                  }}
                  className="mr-4 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {open && data && data.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-lg z-50 overflow-hidden text-left">
              {data.slice(0, 5).map((entry) => {
                const cat = entry.category as {
                  name: string;
                  slug: string;
                  section: { name: string; slug: string };
                } | null;
                if (!cat) return null;
                return (
                  <button
                    key={entry.id}
                    onClick={() =>
                      handleSelect(cat.section.slug, cat.slug, entry.slug)
                    }
                    className="w-full flex flex-col px-4 py-3 hover:bg-stone-50 transition-colors text-left border-b border-stone-100 last:border-0 cursor-pointer"
                  >
                    <span className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-0.5">
                      {cat.section.name} · {cat.name}
                    </span>
                    <span className="font-[family-name:var(--font-lora)] text-stone-800 text-sm font-medium line-clamp-1">
                      {entry.heading}
                    </span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setOpen(false);
                  void navigate({ to: "/search", search: { q: query } });
                }}
                className="w-full px-4 py-2.5 bg-stone-50 text-xs text-stone-500 hover:text-stone-700 transition-colors text-left cursor-pointer border-t border-stone-100"
              >
                See all results for "{query}"
              </button>
            </div>
          )}
        </div>

        {/* Section cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <SectionCard
            to="/islam"
            title="Islam"
            subtitle="Fasting, Prayer, Inheritance, Hajj, Umrah — structured entries drawn from primary sources."
            theme="islam"
            icon={<MdOutlineMosque className="text-white w-7 h-7" />}
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
          <span className="text-stone-400 text-sm">
            Ma'rifah Hub · Free public reference · No accounts required
          </span>
        </div>
      </footer>
    </div>
  );
}

type SectionCardProps = {
  to: string;
  title: string;
  subtitle: string;
  theme: "islam" | "gk";
  icon: React.ReactNode;
};

function SectionCard({ to, title, subtitle, theme, icon }: SectionCardProps) {
  const navigate = useNavigate();
  const isIslam = theme === "islam";

  const surface = isIslam
    ? "bg-islam-surface border-islam-border hover:border-islam-accent"
    : "bg-gk-surface border-gk-border hover:border-gk-primary";
  const iconBg = isIslam ? "bg-islam-primary" : "bg-gk-primary";
  const heading = isIslam ? "text-islam-primary" : "text-gk-primary";
  const cta = isIslam ? "text-islam-accent" : "text-gk-accent";

  return (
    <button
      onClick={() => void navigate({ to })}
      className={`group cursor-pointer w-full border-2 rounded-2xl p-10 flex flex-col items-start text-left hover:shadow-lg transition-all duration-200 ${surface}`}
    >
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200 ${iconBg}`}
      >
        {icon}
      </div>
      <h2
        className={`font-[family-name:var(--font-lora)] text-3xl font-bold mb-3 ${heading}`}
      >
        {title}
      </h2>
      <p className="text-stone-600 text-base leading-relaxed mb-6 flex-1">
        {subtitle}
      </p>
      <div
        className={`flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all duration-200 ${cta}`}
      >
        <span>Browse categories</span>
        <ChevronRight />
      </div>
    </button>
  );
}

function BookIcon() {
  return (
    <svg
      className="w-7 h-7 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}
