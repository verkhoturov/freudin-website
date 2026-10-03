export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      account_contacts: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cities: {
        Row: {
          country_code: string;
          id: number;
          name: string;
          population: number;
          region: string;
          search_name: string;
        };
        Insert: {
          country_code: string;
          id: number;
          name: string;
          population?: number;
          region?: string;
          search_name: string;
        };
        Update: {
          country_code?: string;
          id?: number;
          name?: string;
          population?: number;
          region?: string;
          search_name?: string;
        };
        Relationships: [];
      };
      profile_page_access: {
        Row: {
          access_token: string;
          id: string;
          password: string;
          updated_at: string;
        };
        Insert: {
          access_token?: string;
          id: string;
          password: string;
          updated_at?: string;
        };
        Update: {
          access_token?: string;
          id?: string;
          password?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_page_access_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_private: {
        Row: {
          birth_date: string | null;
          concerns: string[];
          created_at: string;
          gender: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          birth_date?: string | null;
          concerns?: string[];
          created_at?: string;
          gender?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          birth_date?: string | null;
          concerns?: string[];
          created_at?: string;
          gender?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          approaches: string[];
          avatar_path: string | null;
          bio: string;
          city_id: number | null;
          client_types: string[];
          contacts: Json;
          country: string | null;
          cover: string;
          created_at: string;
          cta_placement: string;
          display_name: string;
          documents: Json;
          education: Json;
          faq: Json;
          highlighted_sections: string[];
          id: string;
          languages: string[];
          link_icons: boolean;
          page_theme: string;
          practice_started_on: string | null;
          preferred_contact: string | null;
          price_amount: number | null;
          price_currency: string | null;
          section_order: string[];
          services: Json;
          social_links: Json;
          updated_at: string;
          username: string;
          visibility: string;
          work_formats: string[];
        };
        Insert: {
          approaches?: string[];
          avatar_path?: string | null;
          bio?: string;
          city_id?: number | null;
          client_types?: string[];
          contacts?: Json;
          country?: string | null;
          cover?: string;
          created_at?: string;
          cta_placement?: string;
          display_name: string;
          documents?: Json;
          education?: Json;
          faq?: Json;
          highlighted_sections?: string[];
          id: string;
          languages?: string[];
          link_icons?: boolean;
          page_theme?: string;
          practice_started_on?: string | null;
          preferred_contact?: string | null;
          price_amount?: number | null;
          price_currency?: string | null;
          section_order?: string[];
          services?: Json;
          social_links?: Json;
          updated_at?: string;
          username: string;
          visibility?: string;
          work_formats?: string[];
        };
        Update: {
          approaches?: string[];
          avatar_path?: string | null;
          bio?: string;
          city_id?: number | null;
          client_types?: string[];
          contacts?: Json;
          country?: string | null;
          cover?: string;
          created_at?: string;
          cta_placement?: string;
          display_name?: string;
          documents?: Json;
          education?: Json;
          faq?: Json;
          highlighted_sections?: string[];
          id?: string;
          languages?: string[];
          link_icons?: boolean;
          page_theme?: string;
          practice_started_on?: string | null;
          preferred_contact?: string | null;
          price_amount?: number | null;
          price_currency?: string | null;
          section_order?: string[];
          services?: Json;
          social_links?: Json;
          updated_at?: string;
          username?: string;
          visibility?: string;
          work_formats?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "profiles_city_fkey";
            columns: ["city_id", "country"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id", "country_code"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_profile_visibility: { Args: { p_username: string }; Returns: string };
      get_unlocked_profile: {
        Args: { p_token: string; p_username: string };
        Returns: {
          approaches: string[];
          avatar_path: string | null;
          bio: string;
          city_id: number | null;
          client_types: string[];
          contacts: Json;
          country: string | null;
          cover: string;
          created_at: string;
          cta_placement: string;
          display_name: string;
          documents: Json;
          education: Json;
          faq: Json;
          highlighted_sections: string[];
          id: string;
          languages: string[];
          link_icons: boolean;
          page_theme: string;
          practice_started_on: string | null;
          preferred_contact: string | null;
          price_amount: number | null;
          price_currency: string | null;
          section_order: string[];
          services: Json;
          social_links: Json;
          updated_at: string;
          username: string;
          visibility: string;
          work_formats: string[];
        }[];
        SetofOptions: {
          from: "*";
          to: "profiles";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      is_valid_profile_faq: { Args: { faq: Json }; Returns: boolean };
      is_valid_profile_services: {
        Args: { client_types: string[]; services: Json };
        Returns: boolean;
      };
      set_profile_visibility: {
        Args: { p_password?: string; p_visibility: string };
        Returns: undefined;
      };
      unlock_profile_page: {
        Args: { p_password: string; p_username: string };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
