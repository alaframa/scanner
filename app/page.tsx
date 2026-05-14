// app/page.tsx

import { redirect } from "next/navigation";
import { getSession } from "@/lib/actions/auth";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "admin") {
    redirect("/admin");
  }

  redirect("/app");
}
