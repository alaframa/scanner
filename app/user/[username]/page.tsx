// app/user/[username]/page.tsx

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PasswordChangeForm } from "@/components/user/PasswordChangeForm";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function UserSecurityPage({ params }: Props) {
  const { username } = await params;
  const session = await getSession();

  if (!session) redirect("/login");

  // Users can only access their own settings; admins can access any
  if (session.username !== username && session.role !== "admin") {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1f1f1f] px-4 py-3 flex items-center gap-3 sticky top-0 z-50 bg-[#0a0a0a]">
        <div className="w-2 h-2 rounded-full bg-[#f0ff44] shadow-[0_0_6px_#f0ff44]" />
        <span className="font-mono text-xs tracking-widest uppercase text-[#888]">
          AssetTrack
        </span>
        <span className="font-mono text-xs text-[#3a3a3a]">/</span>
        <span className="font-mono text-xs tracking-widest uppercase text-[#f5f5f5]">
          Security
        </span>
        <span className="font-mono text-xs text-[#3a3a3a]">/</span>
        <span className="font-mono text-xs text-[#888]">{username}</span>
      </header>

      {/* Body */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <PasswordChangeForm
          username={username}
          isAdmin={session.role === "admin"}
        />
      </main>
    </div>
  );
}
