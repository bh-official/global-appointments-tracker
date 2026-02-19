import { BrowserRouter, Routes, Route } from "react-router";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

import { useEffect } from "react";
import { supabase } from "./lib/supabase";

export default function App() {
  useEffect(() => {
    const checkConnection = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log("Session:", data);
      console.log("Error:", error);
    };

    checkConnection();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
