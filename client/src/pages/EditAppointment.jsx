import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";

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
    <div className="w-full max-w-xl p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Edit Appointment</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <input
          type="datetime-local"
          name="appointment_datetime"
          value={formData.appointment_datetime}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <input
          type="text"
          name="timezone"
          value={formData.timezone}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.category_name}
            </option>
          ))}
        </select>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Update Appointment
        </button>
      </form>
    </div>
  );
}
