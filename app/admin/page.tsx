// app/admin/page.tsx

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/app");

  return <AdminDashboard currentUser={session.username} />;
}
