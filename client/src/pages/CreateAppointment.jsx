import { useState } from "react";
import { useNavigate } from "react-router";

export default function CreateAppointment() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    title: "",
    appointment_datetime: "",
    timezone: "",
    category_id: "",
    reminders: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const reminderArray = formData.reminders
      ? formData.reminders.split(",").map((r) => Number(r.trim()))
      : [];

    const response = await fetch(`${API_URL}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        reminders: reminderArray,
        user_id: null, // temporarily null unless you want to pass logged in user
      }),
    });

    if (response.ok) {
      navigate("/appointments");
    } else {
      alert("Failed to create appointment");
    }
  };