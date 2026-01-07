import AdminBottomNav from "../components/navigation/AdminBottomNav";
import PageContainer from "../components/layout/PageContainer";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
      <main className="flex-1 pb-20">
        <PageContainer>{children}</PageContainer>
      </main>
      <AdminBottomNav />
    </div>
  );
}
