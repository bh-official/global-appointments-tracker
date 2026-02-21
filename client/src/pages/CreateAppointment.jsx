// import { useState } from "react";
// import { useNavigate } from "react-router";
// import { supabase } from "../lib/supabase";

// const [categories, setCategories] = useState([]);

// export default function CreateAppointment() {
//   const navigate = useNavigate();
//   const API_URL = import.meta.env.VITE_API_URL;

//   const [formData, setFormData] = useState({
//     title: "",
//     appointment_datetime: "",
//     timezone: "",
//     category_id: "",
//     reminders: "",
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const reminderArray = formData.reminders
//       ? formData.reminders.split(",").map((r) => Number(r.trim()))
//       : [];

//     const { data: sessionData } = await supabase.auth.getSession();
//     const userId = sessionData.session.user.id;

//     const response = await fetch(`${API_URL}/appointments`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         title: formData.title,
//         appointment_datetime: formData.appointment_datetime,
//         timezone: formData.timezone,
//         category_id: Number(formData.category_id),
//         user_id: userId,
//         reminders: reminderArray,
//       }),
//     });
//     const data = await response.json();
//     console.log("Server response:", data);
//     if (response.ok) {
//       navigate("/appointments");
//     } else {
//       alert("Failed to create appointment");
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Create Appointment</h1>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="text"
//           name="title"
//           placeholder="Title"
//           value={formData.title}
//           onChange={handleChange}
//           className="border p-2 w-full"
//           required
//         />

//         <input
//           type="datetime-local"
//           name="appointment_datetime"
//           value={formData.appointment_datetime}
//           onChange={handleChange}
//           className="border p-2 w-full"
//           required
//         />

//         <input
//           type="text"
//           name="timezone"
//           placeholder="Timezone (e.g. Europe/London)"
//           value={formData.timezone}
//           onChange={handleChange}
//           className="border p-2 w-full"
//           required
//         />

//         <select
//           name="category_id"
//           value={formData.category_id}
//           onChange={handleChange}
//           className="border p-2 w-full"
//           required
//         >
//           <option value="">Select Category</option>
//           <option value="1">Doctor</option>
//           <option value="2">Work</option>
//           <option value="3">Personal</option>
//           <option value="4">Fitness</option>
//           <option value="5">Other</option>
//           <option value="6">Kids</option>
//         </select>

//         <input
//           type="text"
//           name="reminders"
//           placeholder="Reminder minutes (comma separated, e.g. 15,30)"
//           value={formData.reminders}
//           onChange={handleChange}
//           className="border p-2 w-full"
//         />

//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//         >
//           Create
//         </button>
//       </form>
//     </div>
//   );
// }

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
        appointment_datetime: formData.appointment_datetime,
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

        <input
          type="text"
          name="timezone"
          placeholder="Timezone (e.g. Europe/London)"
          value={formData.timezone}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

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
