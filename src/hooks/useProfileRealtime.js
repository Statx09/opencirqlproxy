import { useEffect } from "react";

export default function useProfileRealtime(userId) {
  useEffect(() => {
    console.log("🔥 HOOK IS MOUNTED", userId);
  }, [userId]);
}