import { createClient } from '@supabase/supabase-js'

// NOTE: Hardcoded credentials due to .env.local loading issues in this environment
// For production deployment, move these to environment variables:
// NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl = 'https://exywmwjsqlotgxwtwvum.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4eXdtd2pzcWxvdGd4d3R3dnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzMyODksImV4cCI6MjA3OTMwOTI4OX0.RF2I4cTH0tfn4AAMYF0-dC5OnlHF__4F5NJ018kC6VY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
