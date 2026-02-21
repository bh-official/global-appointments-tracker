import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";

export default function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    title: "",
    appointment_datetime: "",
    timezone: "",
    category_id: "",
  });

  useEffect(() => {
    const fetchAppointment = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const response = await fetch(`${API_URL}/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      setFormData({
        title: result.appointment_title,
        appointment_datetime: result.scheduled_at.slice(0, 16),
        timezone: result.meeting_timezone,
        category_id: "",
      });
    };

    fetchAppointment();
  }, [id, API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      navigate(`/appointments/${id}`);
    } else {
      alert("Failed to update appointment");
    }
  };

  return (
    <div className="w-full max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Edit Appointment</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="border p-2 w-full"
        />

        <input
          type="datetime-local"
          value={formData.appointment_datetime}
          onChange={(e) =>
            setFormData({ ...formData, appointment_datetime: e.target.value })
          }
          className="border p-2 w-full"
        />

        <input
          type="text"
          value={formData.timezone}
          onChange={(e) =>
            setFormData({ ...formData, timezone: e.target.value })
          }
          className="border p-2 w-full"
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Update
        </button>
      </form>
    </div>
  );
}
