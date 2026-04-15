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
  public: {
    Tables: {
      crisis_results: {
        Row: {
          completed_at: string
          id: string
          max_score: number
          scenario_id: string
          scenario_title: string
          score: number
          score_percentage: number
          step_scores: number[]
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          max_score: number
          scenario_id: string
          scenario_title: string
          score: number
          score_percentage: number
          step_scores?: number[]
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          max_score?: number
          scenario_id?: string
          scenario_title?: string
          score?: number
          score_percentage?: number
          step_scores?: number[]
          user_id?: string
        }
        Relationships: []
      }
      holdings: {
        Row: {
          added_at: string
          company_name_kr: string
          id: string
          is_active: boolean
          sentence_count: number
          ticker: string
          user_id: string
        }
        Insert: {
          added_at?: string
          company_name_kr: string
          id?: string
          is_active?: boolean
          sentence_count?: number
          ticker: string
          user_id: string
        }
        Update: {
          added_at?: string
          company_name_kr?: string
          id?: string
          is_active?: boolean
          sentence_count?: number
          ticker?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "holdings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          current_level: number
          current_streak: number
          display_name: string | null
          id: string
          last_sentence_date: string | null
          longest_streak: number
          total_sentences: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_streak?: number
          display_name?: string | null
          id: string
          last_sentence_date?: string | null
          longest_streak?: number
          total_sentences?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_level?: number
          current_streak?: number
          display_name?: string | null
          id?: string
          last_sentence_date?: string | null
          longest_streak?: number
          total_sentences?: number
          updated_at?: string
        }
        Relationships: []
      }
      question_templates: {
        Row: {
          id: string
          is_active: boolean
          language: string
          placeholder_text: string | null
          template_text: string
          type: Database["public"]["Enums"]["question_type"]
        }
        Insert: {
          id?: string
          is_active?: boolean
          language?: string
          placeholder_text?: string | null
          template_text: string
          type: Database["public"]["Enums"]["question_type"]
        }
        Update: {
          id?: string
          is_active?: boolean
          language?: string
          placeholder_text?: string | null
          template_text?: string
          type?: Database["public"]["Enums"]["question_type"]
        }
        Relationships: []
      }
      sentences: {
        Row: {
          answer_text: string
          created_at: string
          holding_id: string
          id: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          user_id: string
        }
        Insert: {
          answer_text: string
          created_at?: string
          holding_id: string
          id?: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          user_id: string
        }
        Update: {
          answer_text?: string
          created_at?: string
          holding_id?: string
          id?: string
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sentences_holding_id_fkey"
            columns: ["holding_id"]
            isOneToOne: false
            referencedRelation: "holdings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sentences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          id: string
          is_active: boolean
          plan_type: Database["public"]["Enums"]["plan_type"]
          renewal_date: string | null
          started_at: string
          stripe_customer_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          plan_type?: Database["public"]["Enums"]["plan_type"]
          renewal_date?: string | null
          started_at?: string
          stripe_customer_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean
          plan_type?: Database["public"]["Enums"]["plan_type"]
          renewal_date?: string | null
          started_at?: string
          stripe_customer_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      plan_type: "free" | "premium"
      question_type: "daily" | "earnings" | "drop" | "surge" | "fomo"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      plan_type: ["free", "premium"],
      question_type: ["daily", "earnings", "drop", "surge", "fomo"],
    },
  },
} as const
