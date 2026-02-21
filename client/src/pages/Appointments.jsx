import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";

export default function Appointments() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [appointments, setAppointments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRange, setSelectedRange] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch categories for filter buttons
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) return;

        const response = await fetch(`${API_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch categories");

        const result = await response.json();
        setCategories(result);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, [API_URL]);

  // fetch appointments with filters for category and date range
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);

        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          setError("Not authenticated.");
          setLoading(false);
          return;
        }

        let url = `${API_URL}/appointments`;
        const params = new URLSearchParams();

        if (selectedCategory) params.append("category", selectedCategory);

        if (selectedRange) params.append("range", selectedRange);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch appointments");

        const result = await response.json();
        setAppointments(result);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [API_URL, selectedCategory, selectedRange]);

  // rendering logic

  if (loading) {
    return <div className="p-6">Loading appointments...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Browse by Category</h1>

      {/* =========================
          CATEGORY FILTER
      ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div
          onClick={() => setSelectedCategory("")}
          className={`border-2 rounded-xl p-6 cursor-pointer text-xl font-semibold transition
          ${
            selectedCategory === ""
              ? "bg-blue-600 text-white"
              : "border-blue-500 text-blue-600 hover:bg-blue-50"
          }`}
        >
          All
        </div>

        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => setSelectedCategory(category.category_name)}
            className={`border-2 rounded-xl p-6 cursor-pointer text-xl font-semibold transition
            ${
              selectedCategory === category.category_name
                ? "bg-blue-600 text-white"
                : "border-blue-500 text-blue-600 hover:bg-blue-50"
            }`}
          >
            {category.category_name}
          </div>
        ))}
      </div>

      {/* =========================
          DATE FILTER
      ========================= */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: "All", value: "" },
          { label: "Upcoming", value: "upcoming" },
          { label: "Past", value: "past" },
          { label: "Today", value: "today" },
          { label: "This Week", value: "week" },
        ].map((range) => (
          <button
            key={range.value}
            onClick={() => setSelectedRange(range.value)}
            className={`px-3 py-1 rounded transition ${
              selectedRange === range.value
                ? "bg-green-600 text-white"
                : "bg-white border"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* =========================
          APPOINTMENT CARDS
      ========================= */}
      {appointments.length === 0 ? (
        <p className="text-gray-600">
          No appointments found for selected filters.
        </p>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Link
              key={appointment.appointment_id}
              to={`/appointments/${appointment.appointment_id}`}
              className="block bg-white p-5 rounded-xl shadow hover:shadow-md transition"
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

              <p className="text-sm text-gray-500">
                Category: {appointment.category}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
