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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      kids: {
        Row: {
          age: number
          created_at: string
          id: string
          interests: string[] | null
          membership: Database["public"]["Enums"]["membership_type"]
          membership_expires_at: string | null
          parent_verified: boolean
          profile_id: string
          school_id_url: string | null
          school_name: string
          updated_at: string
        }
        Insert: {
          age: number
          created_at?: string
          id?: string
          interests?: string[] | null
          membership?: Database["public"]["Enums"]["membership_type"]
          membership_expires_at?: string | null
          parent_verified?: boolean
          profile_id: string
          school_id_url?: string | null
          school_name: string
          updated_at?: string
        }
        Update: {
          age?: number
          created_at?: string
          id?: string
          interests?: string[] | null
          membership?: Database["public"]["Enums"]["membership_type"]
          membership_expires_at?: string | null
          parent_verified?: boolean
          profile_id?: string
          school_id_url?: string | null
          school_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kids_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          city: string
          colony: string | null
          created_at: string
          full_address: string | null
          id: string
          pincode: string | null
          profile_id: string
          sector: string | null
          state: string
          updated_at: string
        }
        Insert: {
          city: string
          colony?: string | null
          created_at?: string
          full_address?: string | null
          id?: string
          pincode?: string | null
          profile_id: string
          sector?: string | null
          state: string
          updated_at?: string
        }
        Update: {
          city?: string
          colony?: string | null
          created_at?: string
          full_address?: string | null
          id?: string
          pincode?: string | null
          profile_id?: string
          sector?: string | null
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_child_links: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          kid_id: string
          parent_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          kid_id: string
          parent_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          kid_id?: string
          parent_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_child_links_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_child_links_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          aadhaar_encrypted: string | null
          aadhaar_last_four: string | null
          created_at: string
          email_verified: boolean
          id: string
          phone_verified: boolean
          profile_id: string
          updated_at: string
        }
        Insert: {
          aadhaar_encrypted?: string | null
          aadhaar_last_four?: string | null
          created_at?: string
          email_verified?: boolean
          id?: string
          phone_verified?: boolean
          profile_id: string
          updated_at?: string
        }
        Update: {
          aadhaar_encrypted?: string | null
          aadhaar_last_four?: string | null
          created_at?: string
          email_verified?: boolean
          id?: string
          phone_verified?: boolean
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          kid_id: string
          parent_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          kid_id: string
          parent_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          kid_id?: string
          parent_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          age: string | null
          brand: string | null
          category_id: string | null
          color: string | null
          condition: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_moderated: boolean
          kid_id: string
          moderated_at: string | null
          moderated_by: string | null
          photos: string[] | null
          size: string | null
          title: string
          updated_at: string
          wants_in_exchange: string | null
        }
        Insert: {
          age?: string | null
          brand?: string | null
          category_id?: string | null
          color?: string | null
          condition: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_moderated?: boolean
          kid_id: string
          moderated_at?: string | null
          moderated_by?: string | null
          photos?: string[] | null
          size?: string | null
          title: string
          updated_at?: string
          wants_in_exchange?: string | null
        }
        Update: {
          age?: string | null
          brand?: string | null
          category_id?: string | null
          color?: string | null
          condition?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_moderated?: boolean
          kid_id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          photos?: string[] | null
          size?: string | null
          title?: string
          updated_at?: string
          wants_in_exchange?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          initiator_listing_id: string
          initiator_parent_approved: boolean
          meetup_coordinates: string | null
          meetup_location: string | null
          parent_approval_status: string
          proposed_exchange: string | null
          responder_listing_id: string
          responder_parent_approved: boolean
          scheduled_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          initiator_listing_id: string
          initiator_parent_approved?: boolean
          meetup_coordinates?: string | null
          meetup_location?: string | null
          parent_approval_status?: string
          proposed_exchange?: string | null
          responder_listing_id: string
          responder_parent_approved?: boolean
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          initiator_listing_id?: string
          initiator_parent_approved?: boolean
          meetup_coordinates?: string | null
          meetup_location?: string | null
          parent_approval_status?: string
          proposed_exchange?: string | null
          responder_listing_id?: string
          responder_parent_approved?: boolean
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_initiator_listing_id_fkey"
            columns: ["initiator_listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_responder_listing_id_fkey"
            columns: ["responder_listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_moderated: boolean
          message: string
          sender_id: string
          trade_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_moderated?: boolean
          message: string
          sender_id: string
          trade_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_moderated?: boolean
          message?: string
          sender_id?: string
          trade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          rating: number
          review: string | null
          reviewee_id: string
          reviewer_id: string
          trade_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          review?: string | null
          reviewee_id: string
          reviewer_id: string
          trade_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          review?: string | null
          reviewee_id?: string
          reviewer_id?: string
          trade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string
          id: string
          points: number
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_redemptions: {
        Row: {
          id: string
          points_used: number
          redeemed_at: string
          reward_type: string
          user_id: string
        }
        Insert: {
          id?: string
          points_used: number
          redeemed_at?: string
          reward_type: string
          user_id: string
        }
        Update: {
          id?: string
          points_used?: number
          redeemed_at?: string
          reward_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          kid_id: string
          payment_id: string | null
          plan_type: Database["public"]["Enums"]["membership_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          kid_id: string
          payment_id?: string | null
          plan_type?: Database["public"]["Enums"]["membership_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          kid_id?: string
          payment_id?: string | null
          plan_type?: Database["public"]["Enums"]["membership_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: true
            referencedRelation: "kids"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_profile_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      membership_type: "free" | "paid"
      user_role: "kid" | "parent" | "admin" | "super_admin"
      verification_status: "pending" | "verified" | "rejected"
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
      membership_type: ["free", "paid"],
      user_role: ["kid", "parent", "admin", "super_admin"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
