import { Link, useLocation } from "react-router";

export default function Header() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "font-bold underline" : "hover:underline";
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">Global Appointments Tracker</h1>

        <nav className="space-x-6">
          <Link to="/" className="hover:underline">
            Home
          </Link>

          <Link to="/dashboard" className="hover:underline">
            Dashboard
          </Link>

          <Link to="/appointments" className="hover:underline">
            Appointments
          </Link>

          <Link to="/login" className="hover:underline">
            Login
          </Link>

          <Link to="/signup" className="hover:underline">
            Signup
          </Link>
        </nav>
      </div>
    </header>
  );
}
