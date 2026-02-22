import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router";

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/appointments");
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
      } else {
        navigate("/appointments");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
      } else {
        alert("Account created. You can now log in.");
        setMode("login");
      }
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center px-6 py-20">
      <div className="glass-card p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 p-3 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 p-3 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-theme bg-white/20 hover:bg-white/30 text-white font-bold py-3 text-lg"
          >
            {mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center mt-8 text-white/70">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-white font-semibold hover:underline"
          >
            {mode === "login" ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
