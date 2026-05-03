import { supabase } from './supabase'
import type { Entry } from '@/types/database'

export const getAllEntries = () =>
  supabase
    .from('entries')
    .select('id, heading, slug, created_at, category:categories(id, name, slug, section:sections(id, name, slug))')
    .order('created_at', { ascending: false })

export const getAllCategories = () =>
  supabase
    .from('categories')
    .select('*, section:sections(id, name, slug)')
    .order('name')

export const getAllSections = () =>
  supabase.from('sections').select('*').order('id')

export const getEntryById = (id: number) =>
  supabase.from('entries').select('*').eq('id', id).single()

type EntryInsert = Omit<Entry, 'id' | 'created_at' | 'updated_at'>

export const createEntry = (entry: EntryInsert) =>
  supabase.from('entries').insert(entry).select().single()

export const updateEntry = (id: number, entry: Partial<EntryInsert>) =>
  supabase.from('entries').update(entry).eq('id', id).select().single()

export const deleteEntry = (id: number) =>
  supabase.from('entries').delete().eq('id', id)

export const createCategory = (data: { section_id: number; name: string; slug: string; icon_name: string }) =>
  supabase.from('categories').insert(data).select().single()

export const deleteCategory = (id: number) =>
  supabase.from('categories').delete().eq('id', id)

export const checkSlugAvailable = (categoryId: number, slug: string, excludeId?: number) =>
  supabase
    .from('entries')
    .select('id')
    .eq('category_id', categoryId)
    .eq('slug', slug)
    .neq('id', excludeId ?? -1)
    .maybeSingle()
