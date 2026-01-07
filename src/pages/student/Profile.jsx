import { FiLogOut, FiUser, FiPhone } from "react-icons/fi";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useAuthUser } from "../../hooks/useAuthUser";
import PageHeader from "../../components/layout/PageHeader";

export default function Profile() {
  const { profile } = useAuthUser();

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <PageHeader name="My Profile" />

      {/* Profile card */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-gray-100 p-3 rounded-full">
            <FiUser />
          </div>
          <div>
            <p className="font-medium">{profile?.name || "Student"}</p>
            <p className="text-sm text-gray-500">
              {profile?.role === "admin" ? "Admin" : "Student"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiPhone />
          {profile?.phone || "—"}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-100 text-red-600 py-3 rounded-xl flex items-center justify-center gap-2"
      >
        <FiLogOut />
        Logout
      </button>
    </div>
  );
}
