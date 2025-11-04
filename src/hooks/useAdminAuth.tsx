import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export type AdminRole = "super_admin" | "operations" | "customer_service";

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
          setAdminRole(null);
          navigate("/auth");
        } else if (session?.user) {
          await checkAdminStatus();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminStatus = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        setLoading(false);
        navigate("/auth");
        return;
      }

      setUser(currentUser);

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id)
        .in("role", ["super_admin", "operations", "customer_service"]);

      if (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setLoading(false);
        navigate("/");
        return;
      }

      if (roles && roles.length > 0) {
        setIsAdmin(true);
        // Get the highest privilege role
        const role = roles[0].role as AdminRole;
        setAdminRole(role);
      } else {
        setIsAdmin(false);
        navigate("/");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error in checkAdminStatus:", error);
      setLoading(false);
      navigate("/auth");
    }
  };

  return { user, isAdmin, adminRole, loading };
};
