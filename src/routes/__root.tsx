import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
  notFoundComponent: NotFoundPage,
});

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p
          className="font-[family-name:var(--font-amiri)] text-6xl text-stone-300 mb-4"
          dir="rtl"
        >
          ٤٠٤
        </p>
        <h1 className="font-[family-name:var(--font-lora)] text-2xl font-bold text-stone-800 mb-2">
          Page not found
        </h1>
        <p className="text-stone-500 text-sm mb-8">
          This page doesn't exist or the entry has been removed.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
