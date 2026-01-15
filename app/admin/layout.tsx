import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !["admin", "super_admin"].includes(session.user.role)) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <AdminSidebar userRole={session.user.role} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
