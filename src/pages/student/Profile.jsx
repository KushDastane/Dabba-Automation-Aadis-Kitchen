import { FiLogOut, FiUser, FiPhone } from "react-icons/fi";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useAuthUser } from "../../hooks/useAuthUser";


export default function Profile() {
  const { profile } = useAuthUser();

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  return (
    <div className="pb-28  min-h-screen px-4">
      {/* PROFILE CARD */}
      <div className="mt-6 max-w-xl mx-auto rounded-3xl bg-white/70 backdrop-blur-md p-5 ring-1 ring-black/5 shadow-sm">
        {/* TOP */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-800 flex items-center justify-center">
            <FiUser className="text-xl" />
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-900">
              {profile?.name || "Student"}
            </p>
            <p className="text-sm text-gray-500">
              {profile?.role === "admin" ? "Admin" : "Student"}
            </p>
          </div>
        </div>

        {/* DETAILS */}
        <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 ring-1 ring-black/5">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
            <FiPhone />
          </div>

          <div>
            <p className="text-xs text-gray-400">Phone Number</p>
            <p className="text-sm font-medium text-gray-800">
              {profile?.phone || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* LOGOUT */}
      <div className="mt-8 max-w-xl mx-auto">
        <button
          onClick={handleLogout}
          className="w-full  cursor-pointer rounded-2xl bg-red-50 text-red-700 py-3
                     font-medium flex items-center justify-center gap-2
                     ring-1 ring-red-200 hover:bg-red-100 transition"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </div>
  );
}
