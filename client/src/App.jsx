import { BrowserRouter, Routes, Route } from "react-router";
import Header from "./components/Header";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Appointments from "./pages/Appointments";
import AppointmentDetails from "./pages/AppointmentDetails";
import CategoryAppointments from "./pages/CategoryAppointments";
import CreateAppointment from "./pages/CreateAppointment";

import { useEffect } from "react";
import { supabase } from "./lib/supabase";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/appointments/:id" element={<AppointmentDetails />} />
            <Route
              path="/category/:categoryName"
              element={<CategoryAppointments />}
            />
            <Route path="/create" element={<CreateAppointment />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
