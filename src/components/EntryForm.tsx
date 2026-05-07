import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
  getAllSections,
  getAllCategories,
  checkSlugAvailable,
} from "@/lib/adminQueries";
import type { Entry, Category, Section } from "@/types/database";

export type EntryFormData = {
  section_id: number | null;
  category_id: number | null;
  heading: string;
  slug: string;
  arabic_text: string;
  body: string;
  reference: string;
  ref_is_link: boolean;
};

type Props = {
  initial?: Partial<Entry>;
  onSubmit: (data: EntryFormData) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
  onCancel: () => void;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function EntryForm({
  initial,
  onSubmit,
  submitLabel,
  isSubmitting,
  onCancel,
}: Props) {
  const [manualSectionId, setManualSectionId] = useState<
    number | null | undefined
  >(undefined);
  const [categoryId, setCategoryId] = useState<number | null>(
    initial?.category_id ?? null,
  );
  const [heading, setHeading] = useState(initial?.heading ?? "");
  const [manualSlug, setManualSlug] = useState(initial?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initial?.slug);
  const [arabicText, setArabicText] = useState(initial?.arabic_text ?? "");
  const [reference, setReference] = useState(initial?.reference ?? "");
  const [refIsLink, setRefIsLink] = useState(initial?.ref_is_link ?? false);
  const [slugError, setSlugError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: sections } = useQuery({
    queryKey: ["admin-sections"],
    queryFn: () => getAllSections().then((r) => r.data ?? []),
  });

  const { data: allCategories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => getAllCategories().then((r) => r.data ?? []),
  });

  const derivedSectionId =
    (
      allCategories?.find((c) => c.id === categoryId) as
        | (Category & { section_id: number })
        | undefined
    )?.section_id ?? null;
  const sectionId =
    manualSectionId !== undefined ? manualSectionId : derivedSectionId;
  const slug = slugManuallyEdited ? manualSlug : slugify(heading);

  const filteredCategories =
    allCategories?.filter((c) => c.section_id === sectionId) ?? [];
  const selectedSection = sections?.find((s) => s.id === sectionId);
  const isIslamSection = selectedSection?.slug === "islam";
  const isGKSection = selectedSection?.slug === "general-knowledge";

  // Validate slug uniqueness with debounce
  useEffect(() => {
    if (!categoryId || !slug) return;
    const timer = setTimeout(async () => {
      const { data } = await checkSlugAvailable(categoryId, slug, initial?.id);
      setSlugError(data ? "This slug is already used in this category." : "");
    }, 400);
    return () => clearTimeout(timer);
  }, [slug, categoryId, initial?.id]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Write the entry body here…" }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initial?.body ?? "",
    editorProps: {
      attributes: {
        class: "tiptap-content focus:outline-none min-h-[200px] text-slate-800",
      },
    },
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};
      if (!sectionId) newErrors.section = "Select a section.";
      if (!categoryId) newErrors.category = "Select a category.";
      if (!heading.trim()) newErrors.heading = "Heading is required.";
      if (!slug.trim()) newErrors.slug = "Slug is required.";
      if (slugError) newErrors.slug = slugError;
      if (!editor?.getText().trim()) newErrors.body = "Body is required.";
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      await onSubmit({
        section_id: sectionId,
        category_id: categoryId,
        heading: heading.trim(),
        slug: slug.trim(),
        arabic_text: arabicText.trim(),
        body: editor?.getHTML() ?? "",
        reference: reference.trim(),
        ref_is_link: refIsLink,
      });
    },
    [
      sectionId,
      categoryId,
      heading,
      slug,
      slugError,
      arabicText,
      reference,
      refIsLink,
      editor,
      onSubmit,
    ],
  );

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-7">
      {/* Section + Category */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="section"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Section
          </label>
          <select
            id="section"
            value={sectionId ?? ""}
            onChange={(e) => {
              setManualSectionId(Number(e.target.value) || null);
              setCategoryId(null);
            }}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors bg-white cursor-pointer appearance-none"
          >
            <option value="">Choose section…</option>
            {sections?.map((s: Section) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.section && (
            <p className="text-red-500 text-xs mt-1">{errors.section}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Category
          </label>
          <select
            id="category"
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(Number(e.target.value) || null)}
            disabled={!sectionId}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors bg-white cursor-pointer appearance-none disabled:opacity-50"
          >
            <option value="">Choose category…</option>
            {filteredCategories.map((c: Category) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">{errors.category}</p>
          )}
        </div>
      </div>

      {/* Heading */}
      <div>
        <label
          htmlFor="heading"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Heading
        </label>
        <input
          id="heading"
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="Entry title…"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors"
        />
        {errors.heading && (
          <p className="text-red-500 text-xs mt-1">{errors.heading}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Slug{" "}
          <span className="text-slate-400 font-normal text-xs ml-1">
            — used in the URL
          </span>
        </label>
        <div
          className={`flex items-center border rounded-xl overflow-hidden focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200 transition-colors ${slugError ? "border-red-400" : "border-slate-300"}`}
        >
          <span className="px-4 py-3 bg-slate-50 text-slate-400 text-sm border-r border-slate-300 select-none whitespace-nowrap">
            /{selectedSection?.slug ?? "…"}/
            {filteredCategories.find((c) => c.id === categoryId)?.slug ?? "…"}/
          </span>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => {
              setManualSlug(e.target.value);
              setSlugManuallyEdited(true);
            }}
            className="flex-1 px-4 py-3 text-slate-800 text-sm bg-white focus:outline-none"
          />
        </div>
        {(errors.slug || slugError) && (
          <p className="text-red-500 text-xs mt-1">
            {errors.slug || slugError}
          </p>
        )}
      </div>

      {/* Arabic Text — CSS hidden, not removed from DOM */}
      <div style={{ display: isIslamSection ? "block" : "none" }}>
        <label
          htmlFor="arabic-text"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Arabic Text{" "}
          <span className="text-slate-400 font-normal text-xs ml-1">
            — displayed above the English body
          </span>
        </label>
        <textarea
          id="arabic-text"
          rows={4}
          dir="rtl"
          lang="ar"
          value={arabicText}
          onChange={(e) => setArabicText(e.target.value)}
          placeholder="أدخل النص العربي هنا…"
          className="w-full px-5 py-4 border border-slate-300 rounded-xl text-slate-800 text-xl placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors resize-none font-[family-name:var(--font-amiri)]"
          style={{ lineHeight: "2", textAlign: "right" }}
        />
      </div>

      {/* Body — TipTap */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Body
        </label>
        <div
          className={`border rounded-xl overflow-hidden focus-within:border-slate-500 transition-colors ${errors.body ? "border-red-400" : "border-slate-300"}`}
        >
          <TipTapToolbar editor={editor} />
          <div className="px-5 py-4 bg-white">
            <EditorContent editor={editor} />
          </div>
        </div>
        {errors.body && (
          <p className="text-red-500 text-xs mt-1">{errors.body}</p>
        )}
      </div>

      {/* Reference */}
      <div>
        <label
          htmlFor="reference"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Reference / Source
        </label>
        <input
          id="reference"
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="e.g. Sahih Bukhari, Book 8, Hadith 411"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors"
        />
        {isGKSection && (
          <div className="flex items-center gap-2 mt-2.5">
            <input
              type="checkbox"
              id="ref-is-link"
              checked={refIsLink}
              onChange={(e) => setRefIsLink(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-slate-700"
            />
            <label
              htmlFor="ref-is-link"
              className="text-sm text-slate-600 cursor-pointer"
            >
              Display as a clickable link
            </label>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !!slugError}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white font-medium text-sm py-3 px-7 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          <CheckIcon />
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

type Editor = ReturnType<typeof useEditor>;

function TipTapToolbar({ editor }: { editor: Editor }) {
  if (!editor) return null;
  const btn = (
    active: boolean,
    onClick: () => void,
    label: string,
    children: React.ReactNode,
  ) => (
    <button
      key={label}
      type="button"
      title={label}
      onClick={onClick}
      className={`px-2.5 py-1.5 text-sm rounded-lg cursor-pointer transition-colors ${active ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 flex items-center gap-1 flex-wrap">
      {btn(
        editor.isActive("bold"),
        () => editor.chain().focus().toggleBold().run(),
        "Bold",
        <strong>B</strong>,
      )}
      {btn(
        editor.isActive("italic"),
        () => editor.chain().focus().toggleItalic().run(),
        "Italic",
        <em>I</em>,
      )}
      <div className="w-px h-5 bg-slate-200 mx-1" />
      {btn(
        editor.isActive("heading", { level: 2 }),
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        "Heading 2",
        "H2",
      )}
      {btn(
        editor.isActive("heading", { level: 3 }),
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        "Heading 3",
        "H3",
      )}
      <div className="w-px h-5 bg-slate-200 mx-1" />
      {btn(
        editor.isActive("bulletList"),
        () => editor.chain().focus().toggleBulletList().run(),
        "Bullet list",
        <ListIcon />,
      )}
      {btn(
        editor.isActive("orderedList"),
        () => editor.chain().focus().toggleOrderedList().run(),
        "Ordered list",
        <OrderedListIcon />,
      )}
      <div className="w-px h-5 bg-slate-200 mx-1" />
      {btn(
        editor.isActive({ textAlign: "right" }),
        () => editor.chain().focus().setTextAlign("right").run(),
        "Align right (Arabic)",
        "RTL",
      )}
      {btn(
        editor.isActive({ textAlign: "left" }),
        () => editor.chain().focus().setTextAlign("left").run(),
        "Align left",
        "LTR",
      )}
      <div className="w-px h-5 bg-slate-200 mx-1" />
      {btn(
        false,
        () =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run(),
        "Insert table",
        <TableIcon />,
      )}
      {editor.isActive("table") && (
        <>
          {btn(
            false,
            () => editor.chain().focus().addRowAfter().run(),
            "Add row",
            "+Row",
          )}
          {btn(
            false,
            () => editor.chain().focus().deleteRow().run(),
            "Delete row",
            "-Row",
          )}
          {btn(
            false,
            () => editor.chain().focus().addColumnAfter().run(),
            "Add column",
            "+Col",
          )}
          {btn(
            false,
            () => editor.chain().focus().deleteColumn().run(),
            "Delete column",
            "-Col",
          )}
          {btn(
            false,
            () => editor.chain().focus().deleteTable().run(),
            "Delete table",
            "×Tbl",
          )}
        </>
      )}
    </div>
  );
}

function ListIcon() {
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
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function OrderedListIcon() {
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
        d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
      />
    </svg>
  );
}

function TableIcon() {
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
        d="M3 10h18M3 14h18M10 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z"
      />
    </svg>
  );
}

function CheckIcon() {
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
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
