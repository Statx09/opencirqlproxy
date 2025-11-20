import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pjllwvqutytxtskzxwka.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqbGx3dnF1dHl0eHRza3p4d2thIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc2ODQ5NCwiZXhwIjoyMDc4MzQ0NDk0fQ.mpou-UB-5DOC7oMMmE5GpKu534dUeV2H_zKAb4bO1n8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
