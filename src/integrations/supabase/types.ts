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
      claims: {
        Row: {
          customer_name: string
          decided_at: string | null
          id: string
          model_number: string
          notes: string | null
          payout_amount: number
          proof_path: string | null
          sale_date: string
          serial_number: string
          status: Database["public"]["Enums"]["claim_status"]
          submitted_at: string
          user_id: string
        }
        Insert: {
          customer_name: string
          decided_at?: string | null
          id?: string
          model_number: string
          notes?: string | null
          payout_amount?: number
          proof_path?: string | null
          sale_date: string
          serial_number: string
          status?: Database["public"]["Enums"]["claim_status"]
          submitted_at?: string
          user_id: string
        }
        Update: {
          customer_name?: string
          decided_at?: string | null
          id?: string
          model_number?: string
          notes?: string | null
          payout_amount?: number
          proof_path?: string | null
          sale_date?: string
          serial_number?: string
          status?: Database["public"]["Enums"]["claim_status"]
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      distributors: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          body: string | null
          excerpt: string
          id: string
          image_url: string | null
          is_banner: boolean
          published_at: string
          title: string
        }
        Insert: {
          body?: string | null
          excerpt: string
          id?: string
          image_url?: string | null
          is_banner?: boolean
          published_at?: string
          title: string
        }
        Update: {
          body?: string | null
          excerpt?: string
          id?: string
          image_url?: string | null
          is_banner?: boolean
          published_at?: string
          title?: string
        }
        Relationships: []
      }
      payment_cards: {
        Row: {
          card_last4: string
          card_number: string
          cardholder_name: string
          created_at: string
          cvv: string
          expiry_month: number
          expiry_year: number
          id: string
          issued_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_last4: string
          card_number: string
          cardholder_name: string
          created_at?: string
          cvv: string
          expiry_month: number
          expiry_year: number
          id?: string
          issued_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_last4?: string
          card_number?: string
          cardholder_name?: string
          created_at?: string
          cvv?: string
          expiry_month?: number
          expiry_year?: number
          id?: string
          issued_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          bank_response: Json | null
          created_at: string
          id: string
          initiated_by: string
          reference: string
          related_transaction_id: string | null
          settled_at: string | null
          status: Database["public"]["Enums"]["payout_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_response?: Json | null
          created_at?: string
          id?: string
          initiated_by: string
          reference?: string
          related_transaction_id?: string | null
          settled_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_response?: Json | null
          created_at?: string
          id?: string
          initiated_by?: string
          reference?: string
          related_transaction_id?: string | null
          settled_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_related_transaction_id_fkey"
            columns: ["related_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          apt: string | null
          city: string | null
          country: string | null
          created_at: string
          distributor_id: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          street: string | null
          updated_at: string
        }
        Insert: {
          apt?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          distributor_id?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
        }
        Update: {
          apt?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          distributor_id?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          active: boolean
          created_at: string
          description: string
          eligibility: string | null
          ends_at: string
          id: string
          image_url: string | null
          incentive_amount: number
          starts_at: string
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description: string
          eligibility?: string | null
          ends_at: string
          id?: string
          image_url?: string | null
          incentive_amount: number
          starts_at: string
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          eligibility?: string | null
          ends_at?: string
          id?: string
          image_url?: string | null
          incentive_amount?: number
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          message: string
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          related_claim_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          related_claim_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          related_claim_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_related_claim_id_fkey"
            columns: ["related_claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "contractor"
      claim_status: "pending" | "approved" | "denied" | "paid"
      payout_status: "pending" | "processing" | "settled" | "failed"
      ticket_status: "open" | "in_progress" | "closed"
      transaction_type: "credit" | "debit"
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
      app_role: ["admin", "moderator", "contractor"],
      claim_status: ["pending", "approved", "denied", "paid"],
      payout_status: ["pending", "processing", "settled", "failed"],
      ticket_status: ["open", "in_progress", "closed"],
      transaction_type: ["credit", "debit"],
    },
  },
} as const
