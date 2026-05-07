export type Section = {
  id: number;
  name: string;
  slug: string;
};

export type Category = {
  id: number;
  section_id: number;
  name: string;
  slug: string;
  icon_name: string;
  description: string | null;
};

export type Entry = {
  id: number;
  category_id: number;
  heading: string;
  arabic_text: string | null;
  body: string;
  reference: string | null;
  ref_is_link: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
};

export type EntryWithBreadcrumb = Entry & {
  category: Category & { section: Section };
};

export type Database = {
  public: {
    Tables: {
      sections: {
        Row: Section;
        Insert: Omit<Section, "id">;
        Update: Partial<Omit<Section, "id">>;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "description"> & {
          description?: string | null;
        };
        Update: Partial<Omit<Category, "id">>;
        Relationships: [
          {
            foreignKeyName: "categories_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "sections";
            referencedColumns: ["id"];
          },
        ];
      };
      entries: {
        Row: Entry;
        Insert: Omit<Entry, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Entry, "id" | "created_at" | "updated_at">>;
        Relationships: [
          {
            foreignKeyName: "entries_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
};
