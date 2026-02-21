import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) {
    return <div className="p-6">Checking authentication...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
