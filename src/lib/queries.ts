import { supabase } from "./supabase";

export const getSections = async () =>
  supabase.from("sections").select("*").order("id");

export const getCategoriesBySection = async (sectionId: number) =>
  supabase
    .from("categories")
    .select("*")
    .eq("section_id", sectionId)
    .order("name");

export const getEntriesByCategory = async (categoryId: number) =>
  supabase
    .from("entries")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at");

export const getEntry = async (categoryId: number, entrySlug: string) =>
  supabase
    .from("entries")
    .select("*")
    .eq("category_id", categoryId)
    .eq("slug", entrySlug)
    .single();

export const getSection = async (sectionSlug: string) =>
  supabase.from("sections").select("*").eq("slug", sectionSlug).single();

export const getCategory = async (sectionId: number, categorySlug: string) =>
  supabase
    .from("categories")
    .select("*")
    .eq("section_id", sectionId)
    .eq("slug", categorySlug)
    .single();

export const searchEntries = async (query: string) =>
  supabase
    .from("entries")
    .select(
      "id, heading, body, slug, category:categories(id, name, slug, section:sections(id, name, slug))",
    )
    .textSearch("fts", query, { type: "websearch" })
    .limit(20);
