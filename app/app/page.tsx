// app/app/page.tsx

import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { ScannerUI } from "@/components/scanner/ScannerUI";

export default async function AppPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <ScannerUI username={session.username} role={session.role} />;
}
