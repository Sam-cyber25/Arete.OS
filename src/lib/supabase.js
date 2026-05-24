import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = 'https://xgvvqrjxxyjtauvxufej.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndnZxcmp4eHlqdGF1dnh1ZmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjQ1ODcsImV4cCI6MjA5NTIwMDU4N30.36YpGrm0eV7aNmPOcutxwkGd4DVaJVh36xFk7iA5sk4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
