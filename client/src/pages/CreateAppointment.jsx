import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";

export default function CreateAppointment() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    appointment_datetime: "",
    timezone: "",
    category_id: "",
    reminders: "",
  });

  // fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const response = await fetch(`${API_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      setCategories(result);
    };

    fetchCategories();
  }, [API_URL]);

  //  HANDLE FORM INPUT CHANGES
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  //   HANDLE ADD NEW CATEGORY
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const response = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ category_name: newCategory }),
    });

    if (response.ok) {
      const created = await response.json();
      setCategories([...categories, created]);
      setNewCategory("");
    }
  };

  // handle form submission to create new appointment
  const handleSubmit = async (e) => {
    e.preventDefault();

    const reminderArray = formData.reminders
      ? formData.reminders.split(",").map((r) => Number(r.trim()))
      : [];

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const response = await fetch(`${API_URL}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: formData.title,
        appointment_datetime: `${formData.appointment_datetime}:00 ${formData.timezone}`,
        timezone: formData.timezone,
        category_id: Number(formData.category_id),
        reminders: reminderArray,
      }),
    });

    if (response.ok) {
      navigate("/appointments");
    } else {
      alert("Failed to create appointment");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Appointment</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
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

        <select
          name="timezone"
          value={formData.timezone}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        >
          <option value="">Select Timezone</option>
          {Intl.supportedValuesOf("timeZone").map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>

        {/* Category Dropdown */}
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

        {/* Add New Category */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border p-2 flex-1"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="bg-gray-600 text-white px-4 rounded"
          >
            Add
          </button>
        </div>

        <input
          type="text"
          name="reminders"
          placeholder="Reminder minutes (e.g. 15,30)"
          value={formData.reminders}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </form>
    </div>
  );
}
