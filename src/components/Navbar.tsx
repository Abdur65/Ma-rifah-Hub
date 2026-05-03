import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchEntries } from "@/lib/queries";
import { useDebounce } from "@/hooks/useDebounce";

type Props = {
  theme?: "islam" | "gk" | "neutral";
};

export function Navbar({ theme = "neutral" }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["search-preview", debouncedQuery],
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

  const bgClass =
    theme === "islam"
      ? "bg-islam-surface border-islam-border"
      : theme === "gk"
        ? "bg-gk-surface border-gk-border"
        : "bg-stone-50 border-stone-200";

  function handleSubmit(e: React.FormEvent) {
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
    <header className={`border-b px-6 py-4 sticky top-0 z-40 ${bgClass}`}>
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <Link
          to="/"
          className="font-[family-name:var(--font-lora)] text-xl font-semibold text-stone-800 hover:text-stone-600 transition-colors shrink-0"
        >
          Ma'rifah Hub
        </Link>

        <div ref={wrapRef} className="relative flex-1 max-w-xs">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center bg-white border border-stone-300 rounded-xl px-3 py-2 gap-2 focus-within:border-stone-500 transition-colors">
              <SearchIcon />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => query.length > 0 && setOpen(true)}
                placeholder="Search…"
                className="bg-transparent text-sm text-stone-800 placeholder-stone-400 focus:outline-none w-full"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setOpen(false);
                  }}
                  className="text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <XIcon />
                </button>
              )}
            </div>
          </form>

          {open && data && data.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-lg z-50 overflow-hidden">
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
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      className="w-4 h-4 text-stone-400 shrink-0"
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
  );
}

function XIcon() {
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
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
