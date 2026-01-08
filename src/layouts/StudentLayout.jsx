import StudentBottomNav from "../components/navigation/StudentBottomNav";
import PageContainer from "../components/layout/PageContainer";

export default function StudentLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#fffaf2] flex flex-col">
      {/* Main content */}
      <main className="flex-1 pb-20">
        <PageContainer>{children}</PageContainer>
      </main>

      {/* Bottom navigation */}
      <StudentBottomNav />
    </div>
  );
}
