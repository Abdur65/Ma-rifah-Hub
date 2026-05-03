import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { EntryForm, type EntryFormData } from '@/components/EntryForm'
import { getEntryById, updateEntry } from '@/lib/adminQueries'

export const Route = createFileRoute('/himayah/edit/$id')({
  component: EditEntryPage,
})

function EditEntryPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: entry, isLoading } = useQuery({
    queryKey: ['admin-entry', id],
    queryFn: () => getEntryById(Number(id)).then(r => r.data ?? null),
  })

  const mutation = useMutation({
    mutationFn: (data: EntryFormData) =>
      updateEntry(Number(id), {
        category_id: data.category_id!,
        heading: data.heading,
        slug: data.slug,
        arabic_text: data.arabic_text || null,
        body: data.body,
        reference: data.reference || null,
        ref_is_link: data.ref_is_link,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-entries'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-entry', id] })
      void navigate({ to: '/himayah' })
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!entry) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-slate-500">Entry not found.</p>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-lora)] text-3xl font-bold text-slate-900">Edit Entry</h1>
        <p className="text-slate-500 text-sm mt-1 line-clamp-1">{entry.heading}</p>
      </div>

      {mutation.error && (
        <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
          Failed to save: {String(mutation.error)}
        </div>
      )}

      <EntryForm
        initial={entry}
        onSubmit={async data => { mutation.mutate(data) }}
        submitLabel="Save Changes"
        isSubmitting={mutation.isPending}
        onCancel={() => void navigate({ to: '/himayah' })}
      />
    </main>
  )
}
