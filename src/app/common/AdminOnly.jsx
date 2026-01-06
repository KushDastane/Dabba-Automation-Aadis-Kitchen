import { useAuthUser } from "../../hooks/useAuthUser";

export default function AdminOnly({ children }) {
  const { loading, role } = useAuthUser();

  // While auth/profile is loading, render nothing
  if (loading) return null;

  // Only render for admin
  if (role !== "admin") return null;

  return children;
}
