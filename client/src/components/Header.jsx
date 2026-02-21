import { Link, useLocation } from "react-router";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname === path
      ? "font-bold text-white border-b-2 border-white"
      : "text-white hover:text-gray-200";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-amber-700 text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-bold">Global Appointments Tracker</h1>

        <nav className="space-x-6">
          <Link to="/" className={isActive("/")}>
            Home
          </Link>

          <Link to="/dashboard" className={isActive("/dashboard")}>
            Dashboard
          </Link>

          <Link to="/appointments" className={isActive("/appointments")}>
            Appointments
          </Link>

          <Link to="/create" className={isActive("/create")}>
            Create
          </Link>

          <Link to="/login" className={isActive("/login")}>
            Login
          </Link>

          <Link to="/signup" className={isActive("/signup")}>
            Signup
          </Link>

          <button
            onClick={handleLogout}
            className="ml-4 bg-red-600 px-3 py-1 rounded"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
