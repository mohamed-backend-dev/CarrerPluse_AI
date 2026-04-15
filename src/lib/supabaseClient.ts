import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xodndlsvefejetomkajo.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZG5kbHN2ZWZlamV0b21rYWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MjQxNTIsImV4cCI6MjA4OTUwMDE1Mn0.dqw3V0dJB1ERv167wdAbRM5Siq6JRlCUObRcmSjgXdg"

// الوظيفة التي يطلبها الخطأ (نحتاجها لكي يعمل النظام)
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && !supabaseUrl.includes('your-project-id')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)