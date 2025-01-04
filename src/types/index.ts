// src/types/index.ts
export interface Env {
    SUPABASE_URL: string
    SUPABASE_KEY: string
  }
  
  export interface CallRecord {
    id: number
    created_at: string
    last_visit_channel: string
    products: string
    notes: string
    customer_id: string
    customer_name: string
    city: string
  }