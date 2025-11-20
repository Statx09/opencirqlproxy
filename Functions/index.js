import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://pjllwvqutytxtskzxwka.supabase.co";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqbGx3dnF1dHl0eHRza3p4d2thIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc2ODQ5NCwiZXhwIjoyMDc4MzQ0NDk0fQ.mpou-UB-5DOC7oMMmE5GpKu534dUeV2H_zKAb4bO1n8";

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  try {
    const { name, keywords, avatarUrl } = await req.json();

    if (!name || !avatarUrl) throw new Error("Name and avatar required");

    const { data, error } = await supabase
      .from("hosts")
      .insert([{ name, keywords, avatar: avatarUrl }]);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

