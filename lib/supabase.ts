import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          bio: string | null;
          location: string | null;
          wallet_balance: number;
          verification_status: 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      requests: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          budget: number;
          urgency: 'GENERAL' | 'SERIOUS' | 'EXTREMELY_URGENT';
          whatsapp: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['requests']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['requests']['Insert']>;
      };
      applications: {
        Row: {
          id: string;
          request_id: string;
          user_id: string;
          applied_at: string;
        };
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'applied_at'>;
        Update: never;
      };
      unlocked_requests: {
        Row: {
          id: string;
          user_id: string;
          request_id: string;
          unlocked_at: string;
        };
        Insert: Omit<Database['public']['Tables']['unlocked_requests']['Row'], 'id' | 'unlocked_at'>;
        Update: never;
      };
    };
  };
}
