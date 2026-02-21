import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";

export default function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [countdown, setCountdown] = useState("");
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

  useEffect(() => {
    if (!appointment) return;

    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date(appointment.scheduled_at);
      const diff = target - now;

      if (diff <= 0) {
        setCountdown("Started / Passed");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [appointment]);

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
  // Format date cleanly like: 3 Mar 2026, 5:37 PM
  const formatDate = (dateString, timezone) => {
    return new Date(dateString).toLocaleString("en-GB", {
      timeZone: timezone,
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Get time difference text
  const getTimeDifference = (dateString) => {
    const now = new Date();
    const appointmentDate = new Date(dateString);
    const diffMs = appointmentDate - now;

    if (diffMs <= 0) return "This appointment has passed.";

    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day(s) remaining`;
    if (diffHours > 0) return `${diffHours} hour(s) remaining`;
    return `${diffMinutes} minute(s) remaining`;
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold mb-4">
        {appointment.appointment_title}
      </h1>

      <div className="mt-4 space-y-2">
        <p>
          <strong>Scheduled Time ({appointment.meeting_timezone}):</strong>{" "}
          {formatDate(appointment.scheduled_at, appointment.meeting_timezone)}
        </p>

        <p>
          <strong>Your Local Time:</strong>{" "}
          {formatDate(
            appointment.scheduled_at,
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          )}
        </p>

        <p className="text-green-600 font-medium">
          {getTimeDifference(appointment.scheduled_at)}
        </p>

        <p className="text-blue-600 font-semibold">Countdown: {countdown}</p>
      </div>

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
      <button
        onClick={() => navigate(`/appointments/${id}/edit`)}
        className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded"
      >
        Edit Appointment
      </button>

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
