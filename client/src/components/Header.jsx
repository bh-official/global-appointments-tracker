import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Check auth session
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const isActive = (path) =>
    location.pathname === path
      ? "btn-theme btn-theme-active"
      : "btn-theme";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 w-full glass-header text-white z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">Global Appointments</h1>

        <nav className="space-x-4 flex items-center">
          <Link to="/" className={isActive("/")}>
            Home
          </Link>

          {user && (
            <>
              {location.pathname !== "/" && (
                <Link to="/appointments" className={isActive("/appointments")}>
                  Appointments
                </Link>
              )}

              <Link to="/create" className={isActive("/create")}>
                Create
              </Link>

              <button
                onClick={handleLogout}
                className="btn-theme"
              >
                Logout
              </button>
            </>
          )}

          {!user && location.pathname !== "/auth" && location.pathname !== "/" && (
            <Link to="/auth" className="btn-theme">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
