import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import { DateTime } from "luxon";

const timeZones = Intl.supportedValuesOf("timeZone");

const getOffsetLabel = (tz) => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(now);
  const offset = parts.find((p) => p.type === "timeZoneName")?.value;
  return `${offset} — ${tz.replace("_", " ")}`;
};

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

    // VALIDATE PAST DATE
    const selectedDateTime = DateTime.fromISO(formData.appointment_datetime, { zone: formData.timezone });
    const now = DateTime.now().setZone(formData.timezone);

    if (selectedDateTime < now) {
      alert(`Cannot schedule appointments in the past. Current time in ${formData.timezone} is ${now.toLocaleString(DateTime.DATETIME_MED)}`);
      return;
    }

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
    <div className="w-full flex-1 px-6 py-24 max-w-3xl mx-auto">
      <div className="glass-card p-8 md:p-12">
        <h1 className="text-3xl font-bold mb-8 text-white">Create Appointment</h1>

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

            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-white/70 ml-1">Timezone</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search city/country (e.g. London)"
                  value={formData.timezoneSearch || ""}
                  onFocus={() => setFormData({ ...formData, showTzDropdown: true })}
                  onChange={(e) => setFormData({ ...formData, timezoneSearch: e.target.value, showTzDropdown: true })}
                  className="w-full bg-white/10 border border-white/20 p-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required={!formData.timezone}
                />

                {formData.showTzDropdown && (
                  <div className="absolute z-50 w-full mt-2 glass-card max-h-60 overflow-y-auto shadow-2xl border border-white/20">
                    {timeZones
                      .filter(tz => tz.toLowerCase().includes((formData.timezoneSearch || "").toLowerCase()))
                      .slice(0, 50) // Performance: only show top 50 matches
                      .map((tz) => (
                        <button
                          key={tz}
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            timezone: tz,
                            timezoneSearch: tz.replace(/_/g, " "),
                            showTzDropdown: false
                          })}
                          className="w-full text-left px-4 py-3 text-white hover:bg-white/10 border-b border-white/5 last:border-0 text-sm transition-colors"
                        >
                          {getOffsetLabel(tz)}
                        </button>
                      ))}
                    {timeZones.filter(tz => tz.toLowerCase().includes((formData.timezoneSearch || "").toLowerCase())).length === 0 && (
                      <div className="p-4 text-white/50 text-sm italic">No matches found.</div>
                    )}
                  </div>
                )}
              </div>
              {formData.timezone && !formData.showTzDropdown && (
                <p className="text-[10px] text-emerald-400 absolute -bottom-5 left-1 font-medium">
                  Selected: {formData.timezone}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70 ml-1">Category</label>
            <div className="flex flex-col gap-4">
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

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 p-3 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="btn-theme text-sm px-6 bg-white/10 hover:bg-white/20"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70 ml-1">Reminders (minutes before)</label>
            <input
              type="text"
              name="reminders"
              placeholder="e.g. 15, 30, 60"
              value={formData.reminders}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 p-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full btn-theme bg-white/20 hover:bg-white/30 text-white font-bold py-4 text-xl shadow-lg"
            >
              Create Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
