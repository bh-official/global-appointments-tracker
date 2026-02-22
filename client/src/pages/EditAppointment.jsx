import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import { DateTime } from "luxon";

export default function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    appointment_datetime: "",
    timezone: "",
    category_id: "",
  });

  // FETCH CATEGORIES
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const response = await fetch(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      setCategories(result);
    };

    fetchCategories();
  }, [API_URL]);

  // FETCH APPOINTMENT
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
        category_id:
          categories.find((c) => c.category_name === result.category)?.id || "",
      });
    };

    fetchAppointment();
  }, [id, API_URL, categories]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDATE PAST DATE
    const selectedDateTime = DateTime.fromISO(formData.appointment_datetime, { zone: formData.timezone });
    const now = DateTime.now().setZone(formData.timezone);

    if (selectedDateTime < now) {
      alert(`Cannot schedule appointments in the past. Current time in ${formData.timezone} is ${now.toLocaleString(DateTime.DATETIME_MED)}`);
      return;
    }

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: formData.title,
        appointment_datetime: formData.appointment_datetime,
        timezone: formData.timezone,
        category_id: Number(formData.category_id),
      }),
    });

    if (response.ok) {
      navigate(`/appointments/${id}`);
    } else {
      alert("Failed to update appointment");
    }
  };

  return (
    <div className="w-full flex-1 px-6 py-24 max-w-3xl mx-auto">
      <div className="glass-card p-8 md:p-12">
        <h1 className="text-3xl font-bold mb-8 text-white">Edit Appointment</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70 ml-1">Title</label>
            <input
              type="text"
              name="title"
              placeholder="Meeting with..."
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 p-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70 ml-1">Date & Time</label>
              <input
                type="datetime-local"
                name="appointment_datetime"
                value={formData.appointment_datetime}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 [color-scheme:dark]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70 ml-1">Timezone</label>
              <input
                type="text"
                name="timezone"
                placeholder="e.g. America/New_York"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 p-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70 ml-1">Category</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 [color-scheme:dark]"
              required
            >
              <option value="" className="bg-teal-900">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id} className="bg-teal-900 text-white">
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full btn-theme bg-white/20 hover:bg-white/30 text-white font-bold py-4 text-xl shadow-lg"
            >
              Update Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
