
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import { SupabaseClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'  // 👈 Important for URL issues in RN

const supabaseUrl = 'ASK'
const supabaseAnonKey = 'ASK'


export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
