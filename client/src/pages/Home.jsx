// export default function Home() {
//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold">
//         Welcome to Global Appointments Tracker
//       </h2>
//       <p className="mt-2 text-gray-600">
//         Manage your meetings across time zones with ease.
//       </p>
//     </div>
//   );
// }

import { Link } from "react-router";

export default function Home() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">
        Welcome to Global Appointments Tracker
      </h2>

      <div className="mt-6 space-x-4">
        <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded">
          Login
        </Link>

        <Link to="/signup" className="bg-gray-200 px-4 py-2 rounded">
          Signup
        </Link>
      </div>
    </div>
  );
}
