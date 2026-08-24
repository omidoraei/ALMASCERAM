// =============================================================================
// Database Types — منطبق با اسکمای supabase/migrations
// لایه:// لایه: 7 (زیرساخت) | در پروژه واقعی با دستور `supabase gen types typescript`
// بازتولید می‌شود. این نسخه دستی و هم‌راستا با Migrationهاست.=========================================================================

export type ApplicationType =
  | 'floor'
  | 'wall'
  | 'floor_and_wall'
  | 'facade'
  | 'pool_and_wet_areas'
  | 'outdoor_landscape';

export type AdminRole = 'super_admin' | 'content_manager' | 'sales_manager' | 'viewer';

export type CustomerType = 'individual' | 'contractor' | 'architect' | 'retailer' | 'wholesaler';

export type InquiryStatus = 'pending' | 'reviewing' | 'quoted' | 'completed' | 'cancelled';

export type AuditLogLevel = 'info' | 'warning' | 'error' | 'critical';

export interface Database {
  public: {
    Tables: {
      surface: {
        Row: {
          id: string;
          name_fa: string;
          name_en: string;
          slug: string;
          description: string | null;
          icon: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['surface']['Row']> & {
          name_fa: string;
          name_en: string;
          slug: string;
        };
        Update: Partial<Database['public']['Tables']['surface']['Row']>;
      };
      finishes: {
        Row: Database['public']['Tables']['surface']['Row'];
        Insert: Database['public']['Tables']['surface']['Insert'];
        Update: Database['public']['Tables']['surface']['Update'];
      };
      spaces: {
        Row: Database['public']['Tables']['surface']['Row'];
        Insert: Database['public']['Tables']['surface']['Insert'];
        Update: Database['public']['Tables']['surface']['Update'];
      };
      collections: {
        Row: {
          id: string;
          name_fa: string;
          name_en: string;
          slug: string;
          description: string | null;
          cover_image_url: string | null;
          is_featured: boolean;
          is_active: boolean;
          sort_order: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['collections']['Row']> & {
          name_fa: string;
          name_en: string;
          slug: string;
        };
        Update: Partial<Database['public']['Tables']['collections']['Row']>;
      };
      series: {
        Row: {
          id: string;
          collection_id: string;
          name_fa: string;
          name_en: string;
          slug: string;
          description: string | null;
          cover_image_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['series']['Row']> & {
          collection_id: string;
          name_fa: string;
          name_en: string;
          slug: string;
        };
        Update: Partial<Database['public']['Tables']['series']['Row']>;
      };
      products: {
        Row: {
          id: string;
          series_id: string;
          surface_id: string | null;
          finish_id: string | null;
          name_fa: string;
          name_en: string;
          slug: string;
          sku_prefix: string;
          description: string | null;
          application_type: ApplicationType;
          color_family: string | null;
          design_pattern: string | null;
          cover_image_url: string | null;
          is_featured: boolean;
          is_active: boolean;
          view_count: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['products']['Row']> & {
          series_id: string;
          name_fa: string;
          name_en: string;
          slug: string;
          sku_prefix: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Row']>;
      };
      sizes: {
        Row: {
          id: string;
          product_id: string;
          size_label: string;
          width_mm: number;
          height_mm: number;
          thickness_mm: number;
          is_rectified: boolean;
          packaging_pieces_per_box: number;
          packaging_boxes_per_pallet: number;
          packaging_m2_per_box: number;
          packaging_weight_per_box_kg: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['sizes']['Row']> & {
          product_id: string;
          size_label: string;
          width_mm: number;
          height_mm: number;
          thickness_mm: number;
          packaging_pieces_per_box: number;
          packaging_boxes_per_pallet: number;
          packaging_m2_per_box: number;
          packaging_weight_per_box_kg: number;
        };
        Update: Partial<Database['public']['Tables']['sizes']['Row']>;
      };
      size_technical_data: {
        Row: {
          id: string;
          size_id: string;
          pei_rating: number | null;
          water_absorption_percent: number | null;
          breaking_strength_n: number | null;
          mohs_hardness: number | null;
          slip_resistance_r_rating: string | null;
          frost_resistant: boolean;
          chemical_resistance: string | null;
          standard_reference: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['size_technical_data']['Row']> & {
          size_id: string;
        };
        Update: Partial<Database['public']['Tables']['size_technical_data']['Row']>;
      };
      inquiries: {
        Row: {
          id: string;
          inquiry_number: string;
          customer_id: string | null;
          status: InquiryStatus;
          full_name: string;
          phone: string;
          email: string;
          company_name: string | null;
          city: string | null;
          message: string | null;
          admin_notes: string | null;
          assigned_admin_id: string | null;
          created_at: string;
          updated_at: string;
          responded_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['inquiries']['Row']> & {
          inquiry_number: string;
          full_name: string;
          phone: string;
          email: string;
        };
        Update: Partial<Database['public']['Tables']['inquiries']['Row']>;
      };
      inquiry_items: {
        Row: {
          id: string;
          inquiry_id: string;
          product_id: string;
          size_id: string;
          quantity_box: number;
          quantity_m2: number | null;
          note: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['inquiry_items']['Row']> & {
          inquiry_id: string;
          product_id: string;
          size_id: string;
          quantity_box: number;
        };
        Update: Partial<Database['public']['Tables']['inquiry_items']['Row']>;
      };
      pending_inquiries: {
        Row: {
          id: string;
          session_token: string;
          email: string | null;
          items: unknown;
          otp_code_hash: string | null;
          otp_expires_at: string | null;
          otp_attempts: number;
          created_at: string;
          expires_at: string;
        };
        Insert: Partial<Database['public']['Tables']['pending_inquiries']['Row']>;
        Update: Partial<Database['public']['Tables']['pending_inquiries']['Row']>;
      };
      admin_profiles: {
        Row: {
          id: string;
          full_name: string;
          role: AdminRole;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['admin_profiles']['Row']> & {
          id: string;
          full_name: string;
        };
        Update: Partial<Database['public']['Tables']['admin_profiles']['Row']>;
      };
      customer_profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          customer_type: CustomerType;
          company_name: string | null;
          province: string | null;
          city: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['customer_profiles']['Row']> & {
          id: string;
          full_name: string;
        };
        Update: Partial<Database['public']['Tables']['customer_profiles']['Row']>;
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_role: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          level: AuditLogLevel;
          metadata: Record<string, unknown>;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['audit_logs']['Row']> & {
          action: string;
          entity_type: string;
        };
        Update: Partial<Database['public']['Tables']['audit_logs']['Row']>;
      };
    };
  };
}
