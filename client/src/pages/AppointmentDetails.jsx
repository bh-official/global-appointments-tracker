import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";

export default function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_URL}/appointments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch appointment");
        }

        const result = await response.json();
        setAppointment(result);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAppointment();
  }, [id, API_URL, navigate]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?",
    );

    if (!confirmDelete) return;

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      navigate("/appointments");
    } else {
      alert("Failed to delete appointment");
    }
  };

  if (!appointment) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {appointment.appointment_title}
      </h1>

      <p className="mt-2">
        Scheduled Time ({appointment.meeting_timezone}):{" "}
        {new Date(appointment.scheduled_at).toLocaleString("en-GB", {
          timeZone: appointment.meeting_timezone,
        })}
      </p>

      <p className="mt-1">
        Your Local Time: {new Date(appointment.scheduled_at).toLocaleString()}
      </p>

      {appointment.reminders &&
        Array.isArray(appointment.reminders) &&
        appointment.reminders.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">Reminders:</h3>
            {appointment.reminders.map((r) => (
              <p key={r.reminder_id}>
                {r.remind_before_minutes} minutes before
              </p>
            ))}
          </div>
        )}
      {/* DELETE BUTTON */}
      <button
        onClick={handleDelete}
        className="mt-6 bg-red-600 text-white px-4 py-2 rounded"
      >
        Delete Appointment
      </button>
    </div>
  );
}
