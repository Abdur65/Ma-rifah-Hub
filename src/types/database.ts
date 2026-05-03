export type Section = {
  id: number
  name: string
  slug: string
}

export type Category = {
  id: number
  section_id: number
  name: string
  slug: string
  icon_name: string
}

export type Entry = {
  id: number
  category_id: number
  heading: string
  arabic_text: string | null
  body: string
  reference: string | null
  ref_is_link: boolean
  slug: string
  created_at: string
  updated_at: string
}

export type EntryWithBreadcrumb = Entry & {
  category: Category & { section: Section }
}

// Supabase generic DB type (minimal — expand as needed)
export type Database = {
  public: {
    Tables: {
      sections:   { Row: Section;   Insert: Omit<Section,  'id'>; Update: Partial<Omit<Section,  'id'>> }
      categories: { Row: Category;  Insert: Omit<Category, 'id'>; Update: Partial<Omit<Category, 'id'>> }
      entries:    { Row: Entry;     Insert: Omit<Entry,    'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Entry, 'id' | 'created_at' | 'updated_at'>> }
    }
  }
}
