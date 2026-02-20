import { BrowserRouter, Routes, Route } from "react-router";
import Header from "./components/Header";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

import { useEffect } from "react";
import { supabase } from "./lib/supabase";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointments" element={<div>Appointments Page</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}
