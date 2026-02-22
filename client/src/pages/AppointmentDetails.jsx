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
    <div className="w-full flex-1 px-6 py-24 max-w-4xl mx-auto">
      <div className="glass-card p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {appointment.appointment_title}
            </h1>
            <span className="bg-white/20 text-white text-xs px-4 py-1 rounded-full uppercase tracking-wider font-bold">
              {appointment.category || "General"}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/appointments/${id}/edit`)}
              className="btn-theme bg-white/10 hover:bg-white/20 text-white"
            >
              Edit Details
            </button>
            <button
              onClick={handleDelete}
              className="btn-theme bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 border-rose-500/30"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <section>
              <h3 className="text-white/50 text-sm font-bold uppercase tracking-widest mb-4">Timing</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 text-white">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="font-bold text-lg">
                      {formatDate(appointment.scheduled_at, appointment.meeting_timezone)}
                    </p>
                    <p className="text-white/60 text-sm">Scheduled ({appointment.meeting_timezone})</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 text-white">
                  <span className="text-2xl">🕒</span>
                  <div>
                    <p className="font-bold text-lg">
                      {formatDate(
                        appointment.scheduled_at,
                        Intl.DateTimeFormat().resolvedOptions().timeZone,
                      )}
                    </p>
                    <p className="text-white/60 text-sm">Your Local Time</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-white/50 text-sm font-bold uppercase tracking-widest mb-4">Status</h3>
              <div className="glass-card bg-white/5 p-4 inline-block">
                <p className="text-white font-bold flex items-center gap-2">
                  <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-400"></span>
                  {countdown}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {getTimeDifference(appointment.scheduled_at)}
                </p>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {appointment.reminders &&
              Array.isArray(appointment.reminders) &&
              appointment.reminders.length > 0 && (
                <section>
                  <h3 className="text-white/50 text-sm font-bold uppercase tracking-widest mb-4">Email Reminders</h3>
                  <div className="flex flex-wrap gap-2">
                    {appointment.reminders.map((r) => (
                      <span key={r.reminder_id} className="glass-card bg-white/10 px-4 py-2 text-white text-sm font-medium">
                        🔔 {r.remind_before_minutes} mins before
                      </span>
                    ))}
                  </div>
                </section>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
