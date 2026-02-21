// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router";

// export default function CategoryAppointments() {
//   const { categoryName } = useParams();
//   const [appointments, setAppointments] = useState([]);
//   const API_URL = import.meta.env.VITE_API_URL;

//   useEffect(() => {
//     const fetchByCategory = async () => {
//       const response = await fetch(
//         `${API_URL}/appointments?category=${categoryName}`,
//       );
//       const data = await response.json();
//       setAppointments(data);
//     };

//     fetchByCategory();
//   }, [categoryName, API_URL]);

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">
//         Appointments in {categoryName}
//       </h1>

//       {appointments.length === 0 ? (
//         <p>No appointments found in this category.</p>
//       ) : (
//         <div className="grid gap-4">
//           {appointments.map((appointment) => (
//             <Link
//               key={appointment.appointment_id}
//               to={`/appointments/${appointment.appointment_id}`}
//               className="block border p-4 rounded hover:bg-gray-100"
//             >
//               <h2 className="font-semibold">{appointment.appointment_title}</h2>
//               <p className="text-sm text-gray-600">
//                 {new Date(appointment.scheduled_at).toLocaleString()}
//               </p>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
