import AdminBottomNav from "../components/navigation/AdminBottomNav";
import AdminSidebar from "../components/navigation/AdminSidebar";
import PageContainer from "../components/layout/PageContainer";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 pb-20 md:pb-8">
          <PageContainer>{children}</PageContainer>
        </main>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden">
          <AdminBottomNav />
        </div>
      </div>
    </div>
  );
}
