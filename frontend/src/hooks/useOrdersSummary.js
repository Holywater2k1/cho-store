import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

// Active = pending | preparing | shipped | delivered | completed
export function useOrdersSummary() {
  const { user } = useAuth();
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setActiveCount(0);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id, status")
          .eq("user_id", user.id)
          .in("status", [
            "pending",
            "preparing",
            "shipped",
            "delivered",
            "completed",
          ]);

        if (cancelled) return;

        if (error) {
          console.error("Failed to load order summary:", error);
          setActiveCount(0);
          return;
        }

        // Make absolutely sure count is always a number
        setActiveCount(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        if (!cancelled) {
          console.error("Order summary error:", err);
          setActiveCount(0);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return activeCount || 0; // guarantee a safe number always
}
