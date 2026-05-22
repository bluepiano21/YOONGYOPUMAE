import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 설정 유무 판별 (플레이스홀더이거나 비어있을 경우 폴백 작동)
const isConfigured = 
  supabaseUrl && 
  supabaseUrl !== '' && 
  supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' && 
  supabaseAnonKey && 
  supabaseAnonKey !== '' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE';

// 안전하게 클라이언트 초기화 (비설정 상태여도 앱이 크래시되지 않도록 보장)
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isSupabaseConfigured = isConfigured;
