import StudentBottomNav from "../components/navigation/StudentBottomNav";
import StudentNavbar from "../components/navigation/StudentNavbar";
import PageContainer from "../components/layout/PageContainer";

export default function StudentLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#fffaf2] flex flex-col">
      {/* Desktop Navbar */}
      <StudentNavbar />

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-8">
        <PageContainer>{children}</PageContainer>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <StudentBottomNav />
      </div>
    </div>
  );
}
