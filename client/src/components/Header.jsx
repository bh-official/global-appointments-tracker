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
      ? "font-bold border-b-2 border-white"
      : "hover:text-gray-200";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-amber-700 text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <h1 className="text-lg font-bold">Global Appointments Tracker</h1>

        <nav className="space-x-6 flex items-center">
          <Link to="/" className={isActive("/")}>
            Home
          </Link>

          {user && (
            <>
              <Link to="/appointments" className={isActive("/appointments")}>
                Appointments
              </Link>

              <Link to="/create" className={isActive("/create")}>
                Create
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          )}

          {/* {!user ? (
            <>
              <Link to="/login" className={isActive("/login")}>
                Login
              </Link>

              <Link to="/signup" className={isActive("/signup")}>
                Signup
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          )} */}
        </nav>
      </div>
    </header>
  );
}
