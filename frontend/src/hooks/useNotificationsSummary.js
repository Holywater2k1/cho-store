// src/hooks/useNotificationsSummary.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useNotificationsSummary() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const load = async () => {
      const { id } = user;

      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", id)
        .eq("is_read", false);

      if (error) {
        console.error("Failed to load notifications:", error.message);
        setUnreadCount(0);
        return;
      }

      setUnreadCount(typeof count === "number" ? count : 0);
    };

    load();
  }, [user]);

  return unreadCount;
}
