import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      <main className="lg:pl-64 min-h-screen">{children}</main>
    </div>
  );
}
