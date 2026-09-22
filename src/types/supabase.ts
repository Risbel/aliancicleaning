export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      cleaning_plans: {
        Row: {
          base_price: number
          created_at: string
          cta_label: string
          description: string | null
          features: string[]
          id: string
          image_bg: string | null
          is_active: boolean
          is_popular: boolean
          name: string
          pet_fee: number
          price_per_bathroom: number
          price_per_bedroom: number
          price_per_sqft: number
          sort_order: number
          type: Database["public"]["Enums"]["cleaning_type"]
          updated_at: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          cta_label?: string
          description?: string | null
          features?: string[]
          id?: string
          image_bg?: string | null
          is_active?: boolean
          is_popular?: boolean
          name: string
          pet_fee?: number
          price_per_bathroom?: number
          price_per_bedroom?: number
          price_per_sqft?: number
          sort_order?: number
          type: Database["public"]["Enums"]["cleaning_type"]
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          cta_label?: string
          description?: string | null
          features?: string[]
          id?: string
          image_bg?: string | null
          is_active?: boolean
          is_popular?: boolean
          name?: string
          pet_fee?: number
          price_per_bathroom?: number
          price_per_bedroom?: number
          price_per_sqft?: number
          sort_order?: number
          type?: Database["public"]["Enums"]["cleaning_type"]
          updated_at?: string
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          address_line: string | null
          city: string | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          source: string
          state: string | null
          updated_at: string
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          source?: string
          state?: string | null
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          source?: string
          state?: string | null
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          address_line: string
          admin_notes: string | null
          assigned_to: string | null
          bathrooms: number
          bedrooms: number
          city: string | null
          confirmation_token: string | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_note: string | null
          customer_phone: string
          desired_visit_date: string
          estimated_price: number | null
          final_price: number | null
          has_pets: boolean
          id: string
          plan_id: string
          square_footage: number
          state: string | null
          status: Database["public"]["Enums"]["quote_status"]
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address_line: string
          admin_notes?: string | null
          assigned_to?: string | null
          bathrooms: number
          bedrooms: number
          city?: string | null
          confirmation_token?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_note?: string | null
          customer_phone: string
          desired_visit_date: string
          estimated_price?: number | null
          final_price?: number | null
          has_pets?: boolean
          id?: string
          plan_id: string
          square_footage: number
          state?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address_line?: string
          admin_notes?: string | null
          assigned_to?: string | null
          bathrooms?: number
          bedrooms?: number
          city?: string | null
          confirmation_token?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_note?: string | null
          customer_phone?: string
          desired_visit_date?: string
          estimated_price?: number | null
          final_price?: number | null
          has_pets?: boolean
          id?: string
          plan_id?: string
          square_footage?: number
          state?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "cleaning_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          id: string
          info: string | null
          is_published: boolean
          name: string
          quote: string
          rating: number
          review_url: string | null
          reviewed_at: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          info?: string | null
          is_published?: boolean
          name: string
          quote: string
          rating?: number
          review_url?: string | null
          reviewed_at?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          info?: string | null
          is_published?: boolean
          name?: string
          quote?: string
          rating?: number
          review_url?: string | null
          reviewed_at?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["staff_role"]
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["staff_role"]
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["staff_role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _admin_count: { Args: never; Returns: number }
      _claim_customer_profile: {
        Args: { p_user_id: string }
        Returns: {
          address_line: string | null
          city: string | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          source: string
          state: string | null
          updated_at: string
          user_id: string | null
          zip_code: string | null
        }
        SetofOptions: {
          from: "*"
          to: "customer_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _dashboard_scope: { Args: never; Returns: string }
      _merge_customer_profiles: {
        Args: { p_source: string; p_target: string }
        Returns: {
          address_line: string | null
          city: string | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          source: string
          state: string | null
          updated_at: string
          user_id: string | null
          zip_code: string | null
        }
        SetofOptions: {
          from: "*"
          to: "customer_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _user_display_name: { Args: { p_user_id: string }; Returns: string }
      accept_quote_by_confirmation_token: {
        Args: { p_token: string }
        Returns: {
          address_line: string
          admin_notes: string | null
          assigned_to: string | null
          bathrooms: number
          bedrooms: number
          city: string | null
          confirmation_token: string | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_note: string | null
          customer_phone: string
          desired_visit_date: string
          estimated_price: number | null
          final_price: number | null
          has_pets: boolean
          id: string
          plan_id: string
          square_footage: number
          state: string | null
          status: Database["public"]["Enums"]["quote_status"]
          updated_at: string
          zip_code: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "quotes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      add_staff_member: {
        Args: {
          p_role: Database["public"]["Enums"]["staff_role"]
          p_user_id: string
        }
        Returns: {
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["staff_role"]
        }
        SetofOptions: {
          from: "*"
          to: "staff_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_customer_profile: {
        Args: never
        Returns: {
          address_line: string | null
          city: string | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          source: string
          state: string | null
          updated_at: string
          user_id: string | null
          zip_code: string | null
        }
        SetofOptions: {
          from: "*"
          to: "customer_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_customer_id: { Args: never; Returns: string }
      find_user_by_email: {
        Args: { p_email: string }
        Returns: {
          email: string
          email_confirmed: boolean
          full_name: string
          id: string
          is_staff: boolean
        }[]
      }
      get_dashboard_kpis: {
        Args: { p_from: string; p_prev_from: string; p_to: string }
        Returns: {
          converted: number
          pending_open: number
          prev_converted: number
          prev_requests: number
          prev_revenue: number
          requests: number
          revenue: number
          unassigned: number
        }[]
      }
      get_dashboard_pipeline: {
        Args: never
        Returns: {
          status: string
          total: number
        }[]
      }
      get_dashboard_plan_mix: {
        Args: { p_from: string; p_to: string }
        Returns: {
          plan_id: string
          plan_name: string
          quotes: number
          revenue: number
        }[]
      }
      get_dashboard_revenue_series: {
        Args: { p_bucket: string; p_from: string; p_to: string; p_tz: string }
        Returns: {
          bucket: string
          jobs: number
          revenue: number
        }[]
      }
      get_dashboard_upcoming_jobs: {
        Args: { p_limit?: number }
        Returns: {
          city: string
          customer_name: string
          desired_visit_date: string
          id: string
          price: number
        }[]
      }
      get_quote_by_confirmation_token: {
        Args: { p_token: string }
        Returns: {
          address_line: string
          admin_notes: string | null
          assigned_to: string | null
          bathrooms: number
          bedrooms: number
          city: string | null
          confirmation_token: string | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_note: string | null
          customer_phone: string
          desired_visit_date: string
          estimated_price: number | null
          final_price: number | null
          has_pets: boolean
          id: string
          plan_id: string
          square_footage: number
          state: string | null
          status: Database["public"]["Enums"]["quote_status"]
          updated_at: string
          zip_code: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "quotes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_staff_members: {
        Args: never
        Returns: {
          cancelled_quotes: number
          completed_quotes: number
          completed_revenue: number
          created_at: string
          declined_quotes: number
          email: string
          full_name: string
          id: string
          last_assigned_at: string
          last_sign_in_at: string
          open_quotes: number
          role: Database["public"]["Enums"]["staff_role"]
          total_assigned: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      merge_customer_profiles: {
        Args: { p_source: string; p_target: string }
        Returns: {
          address_line: string | null
          city: string | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          source: string
          state: string | null
          updated_at: string
          user_id: string | null
          zip_code: string | null
        }
        SetofOptions: {
          from: "*"
          to: "customer_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      remove_staff_member: { Args: { p_user_id: string }; Returns: undefined }
      set_staff_role: {
        Args: {
          p_role: Database["public"]["Enums"]["staff_role"]
          p_user_id: string
        }
        Returns: {
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["staff_role"]
        }
        SetofOptions: {
          from: "*"
          to: "staff_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      cleaning_type: "standard" | "deep" | "move_in_out"
      quote_status:
        | "pending"
        | "reviewed"
        | "quoted"
        | "accepted"
        | "declined"
        | "completed"
        | "cancelled"
      staff_role: "admin" | "manager" | "staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      cleaning_type: ["standard", "deep", "move_in_out"],
      quote_status: [
        "pending",
        "reviewed",
        "quoted",
        "accepted",
        "declined",
        "completed",
        "cancelled",
      ],
      staff_role: ["admin", "manager", "staff"],
    },
  },
} as const
