/**
 * Supabase Database types (수동 작성).
 * 출처: supabase/migrations/0001~0004
 *
 * 추후 라이브 DB 연결 후 `bunx supabase gen types typescript --linked > lib/supabase/types.ts`
 * 로 자동 생성 가능. MVP 동안은 수동 유지.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProductEdition = "BASIC" | "ALL_IN_ONE";
export type ProductSizeClass = "M" | "L";
export type PetType = "cat" | "dog" | "both";

/**
 * Stage 18 — master product variants (JSONB).
 * 2 axes (에디션·사이즈) × 4 SKU.
 */
export type ProductVariants = {
  axes: Array<{
    id: string;
    label: string;
    options: Array<{ id: string; label: string; sub?: string }>;
  }>;
  skus: Array<{
    id: string;
    edition: string;
    size: string;
    price: number;
    size_outer: string;
    size_entry: string;
    includes: string[];
  }>;
};
export type OrderStatus =
  | "pending"
  | "paid"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "failed";
export type FaqCategory = "제품" | "배송" | "환불" | "돌봄";
export type ReviewSource = "manual" | "instagram" | "imported";
export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          size_outer: string | null;
          size_entry: string | null;
          includes: Json;
          edition: ProductEdition;
          size_class: ProductSizeClass;
          pet_type: PetType;
          description_html: string | null;
          hero_image: string | null;
          gallery: Json | null;
          active: boolean;
          display_order: number;
          created_at: string;
          // Stage 18 — variants
          variants: Json | null;
          is_master: boolean;
          price_min: number | null;
          price_max: number | null;
        };
        Insert: {
          id: string;
          name: string;
          price: number;
          size_outer?: string | null;
          size_entry?: string | null;
          includes: Json;
          edition: ProductEdition;
          size_class: ProductSizeClass;
          pet_type?: PetType;
          description_html?: string | null;
          hero_image?: string | null;
          gallery?: Json | null;
          active?: boolean;
          display_order?: number;
          created_at?: string;
          variants?: Json | null;
          is_master?: boolean;
          price_min?: number | null;
          price_max?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          size_outer?: string | null;
          size_entry?: string | null;
          includes?: Json;
          edition?: ProductEdition;
          size_class?: ProductSizeClass;
          pet_type?: PetType;
          description_html?: string | null;
          hero_image?: string | null;
          gallery?: Json | null;
          active?: boolean;
          display_order?: number;
          created_at?: string;
          variants?: Json | null;
          is_master?: boolean;
          price_min?: number | null;
          price_max?: number | null;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_no: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          amount: number;
          buyer_name: string;
          buyer_phone: string;
          buyer_email: string | null;
          ship_zipcode: string;
          ship_address1: string;
          ship_address2: string | null;
          ship_memo: string | null;
          status: OrderStatus;
          toss_payment_key: string | null;
          toss_order_id: string | null;
          toss_paid_at: string | null;
          alimtalk_sent_at: string | null;
          alimtalk_attempts: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_no: string;
          product_id: string;
          variant_id?: string | null;
          quantity: number;
          amount: number;
          buyer_name: string;
          buyer_phone: string;
          buyer_email?: string | null;
          ship_zipcode: string;
          ship_address1: string;
          ship_address2?: string | null;
          ship_memo?: string | null;
          status?: OrderStatus;
          toss_payment_key?: string | null;
          toss_order_id?: string | null;
          toss_paid_at?: string | null;
          alimtalk_sent_at?: string | null;
          alimtalk_attempts?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_no?: string;
          product_id?: string;
          variant_id?: string | null;
          quantity?: number;
          amount?: number;
          buyer_name?: string;
          buyer_phone?: string;
          buyer_email?: string | null;
          ship_zipcode?: string;
          ship_address1?: string;
          ship_address2?: string | null;
          ship_memo?: string | null;
          status?: OrderStatus;
          toss_payment_key?: string | null;
          toss_order_id?: string | null;
          toss_paid_at?: string | null;
          alimtalk_sent_at?: string | null;
          alimtalk_attempts?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string | null;
          rating: number;
          title: string | null;
          body: string;
          reviewer_name: string | null;
          reviewer_pet_type: string | null;
          photos: Json | null;
          source: ReviewSource;
          verified: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          rating: number;
          title?: string | null;
          body: string;
          reviewer_name?: string | null;
          reviewer_pet_type?: string | null;
          photos?: Json | null;
          source?: ReviewSource;
          verified?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          rating?: number;
          title?: string | null;
          body?: string;
          reviewer_name?: string | null;
          reviewer_pet_type?: string | null;
          photos?: Json | null;
          source?: ReviewSource;
          verified?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          id: string;
          category: FaqCategory;
          question: string;
          answer_html: string;
          display_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          category: FaqCategory;
          question: string;
          answer_html: string;
          display_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          category?: FaqCategory;
          question?: string;
          answer_html?: string;
          display_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          consent_at: string;
          source: string | null;
          unsubscribed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          consent_at: string;
          source?: string | null;
          unsubscribed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          consent_at?: string;
          source?: string | null;
          unsubscribed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      instagram_posts: {
        Row: {
          id: string;
          permalink: string;
          caption: string | null;
          media_url: string;
          thumbnail_url: string | null;
          media_type: InstagramMediaType;
          posted_at: string | null;
          display_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          permalink: string;
          caption?: string | null;
          media_url: string;
          thumbnail_url?: string | null;
          media_type: InstagramMediaType;
          posted_at?: string | null;
          display_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          permalink?: string;
          caption?: string | null;
          media_url?: string;
          thumbnail_url?: string | null;
          media_type?: InstagramMediaType;
          posted_at?: string | null;
          display_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
