import { useAuthUser } from "../../hooks/useAuthUser";

export default function StudentOnly({ children }) {
  const { loading, role } = useAuthUser();

  // While auth/profile is loading, render nothing
  if (loading) return null;

  // Only render for student
  if (role !== "student") return null;

  return children;
}
