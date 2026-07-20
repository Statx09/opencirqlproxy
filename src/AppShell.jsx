import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import LandingPage from "./LandingPage";

export default function AppShell() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return <LandingPage user={user} />;
}