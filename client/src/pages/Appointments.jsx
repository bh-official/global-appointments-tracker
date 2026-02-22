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
  console.log("API URL:", API_URL);

  // fetch appointments with filters for category and date range
  useEffect(() => {
    console.log("API URL:", API_URL);

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
    <div className="w-full flex-1 px-6 py-24 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-white tracking-tight">Your Appointments</h1>

      {/* =========================
          CATEGORY FILTER
      ========================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
        <button
          onClick={() => setSelectedCategory("")}
          className={`btn-theme py-4 text-lg ${selectedCategory === ""
              ? "btn-theme-active bg-white/30"
              : "bg-white/10 hover:bg-white/20"
            }`}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.category_name)}
            className={`btn-theme py-4 text-lg ${selectedCategory === category.category_name
                ? "btn-theme-active bg-white/30"
                : "bg-white/10 hover:bg-white/20"
              }`}
          >
            {category.category_name}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        {/* =========================
            DATE FILTER
        ========================= */}
        <div className="flex flex-wrap gap-3">
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
              className={`btn-theme px-6 text-sm ${selectedRange === range.value
                  ? "btn-theme-active bg-white/30"
                  : "bg-white/10 hover:bg-white/20"
                }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================
          APPOINTMENT CARDS
      ========================= */}
      {appointments.length === 0 ? (
        <div className="glass-card p-12 text-center text-white/70 text-xl">
          No appointments found for selected filters.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {appointments.map((appointment) => (
            <div
              key={appointment.appointment_id}
              className="glass-card p-6 flex flex-col justify-between"
            >
              <Link to={`/appointments/${appointment.appointment_id}`} className="group">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-white group-hover:text-white/80 transition">
                    {appointment.appointment_title}
                  </h2>
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                    {appointment.category}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <p className="text-white font-medium flex items-center gap-2">
                    <span className="opacity-70">📅</span>
                    {new Date(appointment.scheduled_at).toLocaleString()}
                  </p>

                  <p className="text-white/70 text-sm flex items-center gap-2">
                    <span className="opacity-70">🌐</span>
                    {appointment.meeting_timezone}
                  </p>
                </div>
              </Link>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/80">
                  <span className="text-lg">❤️</span>
                  <span className="font-bold">{appointment.like_count || 0}</span>
                </div>

                <button
                  onClick={async (e) => {
                    e.preventDefault();

                    const { data } = await supabase.auth.getSession();
                    const token = data.session?.access_token;

                    const method = appointment.liked_by_user
                      ? "DELETE"
                      : "POST";

                    await fetch(
                      `${API_URL}/appointments/${appointment.appointment_id}/like`,
                      {
                        method,
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      },
                    );

                    // re-fetch after like/unlike
                    window.location.reload();
                  }}
                  className={`btn-theme text-sm px-6 ${appointment.liked_by_user
                      ? "bg-rose-500/40 border-rose-500/50"
                      : "bg-white/10 hover:bg-white/20"
                    }`}
                >
                  {appointment.liked_by_user ? "Liked" : "Like"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
