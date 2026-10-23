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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity: string
          entity_id: string | null
          id: string
          organization_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity: string
          entity_id?: string | null
          id?: string
          organization_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: string
          organization_id?: string | null
        }
        Relationships: []
      }
      coach_assignments: {
        Row: {
          active: boolean
          coach_id: string
          ended_at: string | null
          id: string
          started_at: string
          team_id: string
        }
        Insert: {
          active?: boolean
          coach_id: string
          ended_at?: string | null
          id?: string
          started_at?: string
          team_id: string
        }
        Update: {
          active?: boolean
          coach_id?: string
          ended_at?: string | null
          id?: string
          started_at?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          created_at: string
          granted: boolean
          guardian_id: string
          id: string
          kind: string
          player_id: string
        }
        Insert: {
          created_at?: string
          granted: boolean
          guardian_id: string
          id?: string
          kind: string
          player_id: string
        }
        Update: {
          created_at?: string
          granted?: boolean
          guardian_id?: string
          id?: string
          kind?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_requests: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_note: string | null
          id: string
          note: string
          organization_id: string
          player_id: string
          requested_by: string
          status: Database["public"]["Enums"]["enrollment_status"]
          team_id: string | null
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          note?: string
          organization_id: string
          player_id: string
          requested_by: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          team_id?: string | null
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          note?: string
          organization_id?: string
          player_id?: string
          requested_by?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_requests_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_relationships: {
        Row: {
          created_at: string
          guardian_id: string
          id: string
          player_id: string
          relation: string
        }
        Insert: {
          created_at?: string
          guardian_id: string
          id?: string
          player_id: string
          relation?: string
        }
        Update: {
          created_at?: string
          guardian_id?: string
          id?: string
          player_id?: string
          relation?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardian_relationships_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          city: string
          created_at: string
          id: string
          is_demo: boolean
          kind: Database["public"]["Enums"]["org_kind"]
          name: string
          verification: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          city?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          kind: Database["public"]["Enums"]["org_kind"]
          name: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          kind?: Database["public"]["Enums"]["org_kind"]
          name?: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      player_profiles: {
        Row: {
          birth_date: string
          created_at: string
          created_by: string
          full_name: string
          id: string
          position: string
        }
        Insert: {
          birth_date: string
          created_at?: string
          created_by: string
          full_name: string
          id?: string
          position?: string
        }
        Update: {
          birth_date?: string
          created_at?: string
          created_by?: string
          full_name?: string
          id?: string
          position?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      team_memberships: {
        Row: {
          active: boolean
          ended_at: string | null
          id: string
          player_id: string
          started_at: string
          team_id: string
        }
        Insert: {
          active?: boolean
          ended_at?: string | null
          id?: string
          player_id: string
          started_at?: string
          team_id: string
        }
        Update: {
          active?: boolean
          ended_at?: string | null
          id?: string
          player_id?: string
          started_at?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_memberships_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          age_group: string
          created_at: string
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          age_group: string
          created_at?: string
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          age_group?: string
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          created_at: string
          created_by: string
          id: string
          location: string
          starts_at: string
          team_id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          location?: string
          starts_at: string
          team_id: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          location?: string
          starts_at?: string
          team_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_coach: {
        Args: { _email: string; _team: string }
        Returns: undefined
      }
      can_view_player: {
        Args: { _player: string; _uid: string }
        Returns: boolean
      }
      claim_parent_role: { Args: never; Returns: undefined }
      create_child: {
        Args: {
          _birth: string
          _consent_data: boolean
          _consent_media: boolean
          _name: string
          _position: string
        }
        Returns: string
      }
      create_team: {
        Args: { _age: string; _name: string; _org: string }
        Returns: string
      }
      create_training: {
        Args: {
          _location: string
          _starts: string
          _team: string
          _title: string
        }
        Returns: string
      }
      decide_enrollment: {
        Args: {
          _decision: Database["public"]["Enums"]["enrollment_status"]
          _note: string
          _req: string
          _team: string
        }
        Returns: undefined
      }
      decide_verification: {
        Args: {
          _note: string
          _org: string
          _status: Database["public"]["Enums"]["verification_status"]
        }
        Returns: undefined
      }
      dev_claim_demo_role: {
        Args: { _org: string; _role: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
      has_org_role: {
        Args: {
          _org: string
          _role: Database["public"]["Enums"]["app_role"]
          _uid: string
        }
        Returns: boolean
      }
      is_association_official: { Args: { _uid: string }; Returns: boolean }
      is_guardian: { Args: { _player: string; _uid: string }; Returns: boolean }
      is_team_admin: { Args: { _team: string; _uid: string }; Returns: boolean }
      is_team_coach: { Args: { _team: string; _uid: string }; Returns: boolean }
      request_enrollment: {
        Args: { _note: string; _org: string; _player: string }
        Returns: string
      }
      submit_verification: { Args: { _org: string }; Returns: undefined }
    }
    Enums: {
      app_role:
        | "player"
        | "parent"
        | "coach"
        | "ssb_admin"
        | "organizer"
        | "association"
      enrollment_status: "pending" | "needs_info" | "approved" | "rejected"
      org_kind: "ssb" | "organizer" | "association"
      verification_status: "unverified" | "pending" | "verified" | "rejected"
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
  public: {
    Enums: {
      app_role: [
        "player",
        "parent",
        "coach",
        "ssb_admin",
        "organizer",
        "association",
      ],
      enrollment_status: ["pending", "needs_info", "approved", "rejected"],
      org_kind: ["ssb", "organizer", "association"],
      verification_status: ["unverified", "pending", "verified", "rejected"],
    },
  },
} as const
