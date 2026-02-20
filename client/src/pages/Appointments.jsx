import { useEffect, useState } from "react";
import { Link } from "react-router";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAppointments = async () => {
      const response = await fetch(`${API_URL}/appointments`);
      const data = await response.json();
      setAppointments(data);
    };

    fetchAppointments();
  }, [API_URL]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Appointments</h1>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Link
            key={appointment.appointment_id}
            to={`/appointments/${appointment.appointment_id}`}
            className="block border p-4 rounded hover:bg-gray-100"
          >
            <h2 className="font-semibold">{appointment.appointment_title}</h2>
            <p className="text-sm text-gray-600">
              {new Date(appointment.scheduled_at).toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
