import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchAppointments = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        setError("Not authenticated.");
        setLoading(false);
        return;
      }

      const token = sessionData.session.access_token;

      const response = await fetch(`${API_URL}/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(); // initial load

    const interval = setInterval(() => {
      fetchAppointments(); // poll every 30 seconds
    }, 30000);

    return () => clearInterval(interval); // cleanup
  }, [API_URL]);

  if (loading) {
    return <div className="p-6">Loading appointments...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Appointments</h1>

      {appointments.length === 0 ? (
        <p className="text-gray-600">No appointments found.</p>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.appointment_id}
              className="bg-white p-5 rounded-xl shadow"
            >
              <h2 className="text-xl font-semibold">
                {appointment.appointment_title}
              </h2>

              <p className="text-gray-600">
                {new Date(appointment.scheduled_at).toLocaleString()}
              </p>

              <p className="text-sm text-blue-600">
                {appointment.meeting_timezone}
              </p>

              {appointment.reminders && appointment.reminders.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium">Reminders:</p>
                  {appointment.reminders.map((r) => (
                    <span
                      key={r.reminder_id}
                      className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded mr-2 mt-2 text-sm"
                    >
                      {r.remind_before_minutes} mins before
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
