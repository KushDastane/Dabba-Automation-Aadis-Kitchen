import { useAuthUser } from "./hooks/useAuthUser";
import DevLogin from "./pages/DevLogin";
import DevDashboard from "./pages/DevDashboard";
import ProfileSetup from "./pages/ProfileSetup";

function App() {
  const { loading, isAuthenticated, isProfileComplete } = useAuthUser();

  if (loading) {
    return <p>Loading auth...</p>;
  }

  if (!isAuthenticated) {
    return <DevLogin />;
  }

  if (!isProfileComplete) {
    return <ProfileSetup />;
  }

  return <DevDashboard />;
}

export default App;
