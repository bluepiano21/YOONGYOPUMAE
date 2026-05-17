import { createClient } from '@supabase/supabase-js';

// .env.local 파일에 적어둔 환경 변수값을 가져옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase와 통신할 수 있는 클라이언트 객체를 생성하고 내보냅니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
