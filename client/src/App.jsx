import { BrowserRouter, Routes, Route } from "react-router";
import Signup from "./pages/Signup";

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

  return <div>Test</div>;
}
