
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import { SupabaseClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'  // 👈 Important for URL issues in RN

const supabaseUrl = 'https://yrogunuhonkdhesvcrno.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyb2d1bnVob25rZGhlc3Zjcm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTQ3NjQsImV4cCI6MjA2ODk5MDc2NH0.xq6YBfpmymkksGJI-7KNIrEhtZYQK9HlprwJkS4df34';


export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
