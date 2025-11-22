import { createClient } from '@supabase/supabase-js';

// Supabase credentials - same as web app
const SUPABASE_URL = 'https://exywmwjsqlotgxwtwvum.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4eXdtd2pzcWxvdGd4d3R3dnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzMyODksImV4cCI6MjA3OTMwOTI4OX0.RF2I4cTH0tfn4AAMYF0-dC5OnlHF__4F5NJ018kC6VY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
