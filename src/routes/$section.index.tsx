import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSection, getCategoriesBySection } from "@/lib/queries";
import { Navbar } from "@/components/Navbar";
import type { Category } from "@/types/database";

export const Route = createFileRoute("/$section/")({
  component: SectionPage,
});

function SectionPage() {
  const { section: sectionSlug } = Route.useParams();
  const theme = sectionSlug === "islam" ? "islam" : "gk";
  const isIslam = theme === "islam";

  const { data: section, isLoading: sLoading } = useQuery({
    queryKey: ["section", sectionSlug],
    queryFn: () => getSection(sectionSlug).then((r) => r.data),
  });

  const { data: categories, isLoading: cLoading } = useQuery({
    queryKey: ["categories", sectionSlug],
    queryFn: () =>
      getCategoriesBySection(section!.id).then((r) => r.data ?? []),
    enabled: !!section,
  });

  if (sLoading || cLoading)
    return (
      <PageShell theme={theme}>
        <Spinner />
      </PageShell>
    );
  if (!section) throw notFound();

  const headerBg = isIslam ? "bg-islam-primary" : "bg-gk-primary";
  const surface = isIslam ? "bg-islam-surface" : "bg-gk-surface";
  const border = isIslam ? "border-islam-border" : "border-gk-border";
  const subtitle = isIslam
    ? "Structured entries on Islamic obligations, rituals, and rulings."
    : "Clear reference entries on science, medicine, and applied disciplines.";

  return (
    <div className={`min-h-screen ${surface}`}>
      <Navbar theme={theme} />

      <div className={headerBg}>
        <div className="max-w-5xl mx-auto px-6 py-14">
          <p
            className={`text-xs font-medium uppercase tracking-widest mb-3 ${isIslam ? "text-islam-accent" : "text-blue-300"}`}
          >
            Section
          </p>
          <h1 className="font-[family-name:var(--font-lora)] text-5xl md:text-6xl font-bold text-white leading-tight">
            {section.name}
          </h1>
          {isIslam && (
            <p
              className="font-[family-name:var(--font-amiri)] text-2xl text-islam-accent mt-2"
              dir="rtl"
            >
              علوم إسلامية
            </p>
          )}
          <p className="text-base mt-4 max-w-xl leading-relaxed text-white/80">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-stone-500">
          <Link
            to="/"
            className={`hover:${isIslam ? "text-islam-primary" : "text-gk-primary"} transition-colors`}
          >
            Home
          </Link>
          <Chevron />
          <span
            className={`font-medium ${isIslam ? "text-islam-primary" : "text-gk-primary"}`}
          >
            {section.name}
          </span>
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-6 pb-20">
        <p className="text-stone-500 text-sm mb-8">
          {categories?.length ?? 0} categories
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories?.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              sectionSlug={sectionSlug}
              isIslam={isIslam}
            />
          ))}
        </div>
      </main>

      <footer className={`border-t py-8 ${border}`}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="text-stone-400 text-sm">
            Ma'rifah Hub · Free public reference
          </span>
        </div>
      </footer>
    </div>
  );
}

function CategoryCard({
  category,
  sectionSlug,
  isIslam,
}: {
  category: Category;
  sectionSlug: string;
  isIslam: boolean;
}) {
  const accentBg = isIslam ? "bg-islam-primary" : "bg-gk-primary";
  const cardSurface = isIslam ? "bg-islam-surface" : "bg-gk-surface";

  return (
    <Link
      to="/$section/$category"
      params={{ section: sectionSlug, category: category.slug }}
      className={`group relative block overflow-hidden rounded-lg border-2 ${isIslam ? "border-islam-border" : "border-gk-border"} ${cardSurface} p-8`}
    >
      {/* Expanding hover circle — starts at top-right corner, fills card on hover */}
      <div
        className={`pointer-events-none absolute -right-4 -top-4 h-8 w-8 rounded-full ${accentBg} transition-transform duration-300 ease-out group-hover:scale-[21]`}
      />

      {/* Corner arrow indicator */}
      <div
        className={`absolute right-0 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-bl-3xl rounded-tr-lg ${accentBg}`}
      >
        <span className="-mr-0.5 -mt-0.5 font-mono text-sm text-white">→</span>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="font-[family-name:var(--font-lora)] text-lg font-semibold text-stone-800 transition-colors duration-300 group-hover:text-white">
          {category.name}
        </p>
        {category.description && (
          <p className="mt-2 text-sm leading-relaxed text-stone-500 transition-colors duration-300 group-hover:text-white/80">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
}

function PageShell({
  theme,
  children,
}: {
  theme: "islam" | "gk";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`min-h-screen ${theme === "islam" ? "bg-islam-surface" : "bg-gk-surface"}`}
    >
      <Navbar theme={theme} />
      <div className="flex items-center justify-center h-64">{children}</div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
  );
}

function Chevron() {
  return (
    <svg
      className="w-3 h-3"
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
