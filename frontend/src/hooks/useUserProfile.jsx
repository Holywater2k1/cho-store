import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!error) {
        setProfile(data);
      } else {
        console.error("Failed to load profile:", error);
      }

      setProfileLoading(false);
    };
    load();
  }, [user]);

  return { profile, profileLoading };
}
