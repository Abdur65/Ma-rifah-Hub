import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EntryForm, type EntryFormData } from '@/components/EntryForm'
import { createEntry } from '@/lib/adminQueries'

export const Route = createFileRoute('/himayah/new')({
  component: NewEntryPage,
})

function NewEntryPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: EntryFormData) =>
      createEntry({
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
      void navigate({ to: '/himayah' })
    },
  })

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-lora)] text-3xl font-bold text-slate-900">New Entry</h1>
        <p className="text-slate-500 text-sm mt-1">Fill in the fields below and click Publish.</p>
      </div>

      {mutation.error && (
        <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
          Failed to publish: {String(mutation.error)}
        </div>
      )}

      <EntryForm
        onSubmit={async data => { mutation.mutate(data) }}
        submitLabel="Publish Entry"
        isSubmitting={mutation.isPending}
        onCancel={() => void navigate({ to: '/himayah' })}
      />
    </main>
  )
}
