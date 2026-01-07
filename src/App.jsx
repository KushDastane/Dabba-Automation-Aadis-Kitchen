import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthUser } from "./hooks/useAuthUser";

import DevLogin from "./pages/DevLogin";
import ProfileSetup from "./pages/ProfileSetup";

// layouts
import StudentLayout from "./layouts/StudentLayout";
import AdminLayout from "./layouts/AdminLayout";

// student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import PlaceOrder from "./pages/student/PlaceOrder";
import StudentOrders from "./pages/student/Orders";
import Khata from "./pages/student/Khata";
import Profile from "./pages/student/Profile";
import AddPayment from "./pages/student/AddPayment";

// admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Orders from "./pages/admin/Orders";
import Payments from "./pages/admin/Payments";
import Menu from "./pages/admin/Menu";

export default function App() {
  const { loading, isAuthenticated, isProfileComplete, role } = useAuthUser();

  if (loading) return <p>Loading...</p>;
  if (!isAuthenticated) return <DevLogin />;
  if (!isProfileComplete) return <ProfileSetup />;

  if (role === "admin") {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AdminLayout>
    );
  }

  // 🎓 STUDENT ROUTES
  return (
    <StudentLayout>
      <Routes>
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/order" element={<PlaceOrder />} />

        {/* ✅ RENAMED */}
        <Route path="/history" element={<StudentOrders />} />

        <Route path="/khata" element={<Khata />} />
        <Route path="/add-payment" element={<AddPayment />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </StudentLayout>
  );
}
