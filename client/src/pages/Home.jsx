// import { Link } from "react-router";
// import CategoryList from "../components/CategoryList";

// export default function Home() {
//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold">
//         Welcome to Global Appointments Tracker
//       </h2>

//       <div className="mt-6 space-x-4">
//         <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded">
//           Login
//         </Link>

//         <Link to="/signup" className="bg-gray-200 px-4 py-2 rounded">
//           Signup
//         </Link>
//       </div>
//       <div className="mt-10">
//         <CategoryList />
//       </div>
//     </div>
//   );
// }

import { Link } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };

    getSession();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-6 text-center">
      {/* HERO SECTION */}
      <h1 className="text-4xl font-bold mb-6">Global Appointments Tracker</h1>

      <p className="max-w-2xl text-gray-600 mb-10">
        Manage your appointments across different time zones, organize them by
        category, set reminders, and keep everything structured in one secure
        place.
      </p>

      {/* CTA BUTTONS */}
      <div className="space-x-4 mb-12">
        {!user ? (
          <>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Signup
            </Link>
          </>
        ) : (
          <Link
            to="/appointments"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Go to My Appointments
          </Link>
        )}
      </div>

      {/* FEATURES SECTION */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-2">Timezone Aware</h3>
          <p className="text-gray-600 text-sm">
            Schedule meetings across different countries without confusion.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-2">Smart Filtering</h3>
          <p className="text-gray-600 text-sm">
            Filter appointments by category, date range, upcoming, past, or
            week.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
          <p className="text-gray-600 text-sm">
            Each user can only view and manage their own appointments.
          </p>
        </div>
      </div>
    </div>
  );
}
