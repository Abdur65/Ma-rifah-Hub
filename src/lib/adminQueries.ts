import { supabase } from "./supabase";
import type { Entry } from "@/types/database";

export const getAllEntries = async () =>
  supabase
    .from("entries")
    .select(
      "id, heading, slug, created_at, category:categories(id, name, slug, section:sections(id, name, slug))",
    )
    .order("created_at", { ascending: false });

export const getAllCategories = async () =>
  supabase
    .from("categories")
    .select("*, section:sections(id, name, slug)")
    .order("name");

export const getAllSections = async () =>
  supabase.from("sections").select("*").order("id");

export const getEntryById = async (id: number) =>
  supabase.from("entries").select("*").eq("id", id).single();

type EntryInsert = Omit<Entry, "id" | "created_at" | "updated_at">;

export const createEntry = async (entry: EntryInsert) =>
  supabase.from("entries").insert(entry).select().single();

export const updateEntry = async (id: number, entry: Partial<EntryInsert>) =>
  supabase.from("entries").update(entry).eq("id", id).select().single();

export const deleteEntry = async (id: number) =>
  supabase.from("entries").delete().eq("id", id);

export const createCategory = async (data: {
  section_id: number;
  name: string;
  slug: string;
  icon_name: string;
  description?: string | null;
}) => supabase.from("categories").insert(data).select().single();

export const deleteCategory = async (id: number) =>
  supabase.from("categories").delete().eq("id", id);

export const checkSlugAvailable = async (
  categoryId: number,
  slug: string,
  excludeId?: number,
) =>
  supabase
    .from("entries")
    .select("id")
    .eq("category_id", categoryId)
    .eq("slug", slug)
    .neq("id", excludeId ?? -1)
    .maybeSingle();
