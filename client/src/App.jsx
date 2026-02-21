import { BrowserRouter, Routes, Route } from "react-router";
import Header from "./components/Header";
import Home from "./pages/Home";

import Auth from "./pages/Auth";

import Appointments from "./pages/Appointments";
import AppointmentDetails from "./pages/AppointmentDetails";
import CreateAppointment from "./pages/CreateAppointment";
import ProtectedRoute from "./components/ProtectedRoute";
import EditAppointment from "./pages/EditAppointment";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full bg-teal-500">
        <Header />
        <main className="flex-1 w-full px-6 flex justify-center">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />

            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments/:id"
              element={
                <ProtectedRoute>
                  <AppointmentDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments/:id/edit"
              element={
                <ProtectedRoute>
                  <EditAppointment />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
