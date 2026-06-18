export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { from_user, to_user } = req.body;

    if (!from_user || !to_user) {
      return res.status(400).json({ error: "Missing params" });
    }

    // Example: insert into Supabase (if you're using it)
    const { createClient } = require("@supabase/supabase-js");

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabase.from("waves").insert([
      {
        from_user,
        to_user,
        created_at: new Date(),
      },
    ]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}