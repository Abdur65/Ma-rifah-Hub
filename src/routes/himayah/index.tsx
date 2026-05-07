import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getAllEntries, deleteEntry, getAllSections } from "@/lib/adminQueries";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

export const Route = createFileRoute("/himayah/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<number | null>(null);

  const { data: sections = [] } = useQuery({
    queryKey: ["admin-sections"],
    queryFn: () => getAllSections().then((r) => r.data ?? []),
  });

  const { data: allEntries, isLoading } = useQuery({
    queryKey: ["admin-entries"],
    queryFn: () => getAllEntries().then((r) => r.data ?? []),
  });

  const activeSectionId = activeSection ?? sections[0]?.id ?? null;
  const entries = allEntries?.filter((entry) => {
    const cat = entry.category as { section: { id: number } } | null;
    return cat?.section?.id === activeSectionId;
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEntry(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-entries"] });
      setDeletingId(null);
    },
  });

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-lora)] text-3xl font-bold text-slate-900">
            Entries
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {entries?.length ?? 0} published entries
          </p>
        </div>
        <Link
          to="/himayah/new"
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <PlusIcon />
          New entry
        </Link>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 mb-8">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeSectionId === section.id
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && entries?.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400 text-sm">No entries in this section.</p>
          <Link
            to="/himayah/new"
            className="text-slate-600 text-sm underline mt-2 inline-block"
          >
            Publish your first entry
          </Link>
        </div>
      )}

      {!isLoading && entries && entries.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3.5 font-medium text-slate-600">
                    Heading
                  </th>
                  <th className="text-left px-6 py-3.5 font-medium text-slate-600 hidden md:table-cell">
                    Section · Category
                  </th>
                  <th className="text-left px-6 py-3.5 font-medium text-slate-600 hidden lg:table-cell">
                    Date
                  </th>
                  <th className="px-6 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => {
                  const cat = entry.category as {
                    name: string;
                    slug: string;
                    section: { name: string; slug: string };
                  } | null;
                  const isIslam = cat?.section.slug === "islam";
                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-[family-name:var(--font-lora)] text-slate-800 font-medium line-clamp-1">
                          {entry.heading}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {cat && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${isIslam ? "bg-islam-surface text-islam-primary" : "bg-gk-surface text-gk-primary"}`}
                          >
                            {cat.section.name} · {cat.name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400 hidden lg:table-cell">
                        {new Date(entry.created_at).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() =>
                              void navigate({
                                to: "/himayah/edit/$id",
                                params: { id: String(entry.id) },
                              })
                            }
                            className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-medium"
                          >
                            Edit
                          </button>

                          <AlertDialog.Root
                            open={deletingId === entry.id}
                            onOpenChange={(open) =>
                              !open && setDeletingId(null)
                            }
                          >
                            <AlertDialog.Trigger asChild>
                              <button
                                onClick={() => setDeletingId(entry.id)}
                                className="text-red-500 hover:text-red-700 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-red-50 text-xs font-medium"
                              >
                                Delete
                              </button>
                            </AlertDialog.Trigger>
                            <AlertDialog.Portal>
                              <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                              <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                                <AlertDialog.Title className="font-[family-name:var(--font-lora)] text-lg font-semibold text-slate-900 mb-2">
                                  Delete this entry?
                                </AlertDialog.Title>
                                <AlertDialog.Description className="text-slate-500 text-sm mb-6">
                                  "
                                  <span className="font-medium text-slate-700">
                                    {entry.heading}
                                  </span>
                                  " will be permanently deleted. This cannot be
                                  undone.
                                </AlertDialog.Description>
                                <div className="flex gap-3 justify-end">
                                  <AlertDialog.Cancel className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors cursor-pointer rounded-xl hover:bg-slate-100">
                                    Cancel
                                  </AlertDialog.Cancel>
                                  <AlertDialog.Action
                                    onClick={() =>
                                      deleteMutation.mutate(entry.id)
                                    }
                                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer font-medium"
                                  >
                                    {deleteMutation.isPending
                                      ? "Deleting…"
                                      : "Delete"}
                                  </AlertDialog.Action>
                                </div>
                              </AlertDialog.Content>
                            </AlertDialog.Portal>
                          </AlertDialog.Root>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}

function PlusIcon() {
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
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}
