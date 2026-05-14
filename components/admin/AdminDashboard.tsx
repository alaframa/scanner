// components/admin/AdminDashboard.tsx

"use client";

import { useState } from "react";
import { LogTab } from "@/components/admin/LogTab";
import { UsersTab } from "@/components/admin/UsersTab";
import { LogOut, Activity, Users } from "lucide-react";
import { logout } from "@/lib/actions/auth";

interface Props {
  currentUser: string;
}

type Tab = "log" | "users";

export function AdminDashboard({ currentUser }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("log");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-[#1f1f1f] px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#f0ff44] shadow-[0_0_6px_#f0ff44]" />
          <span className="font-mono text-xs tracking-widest uppercase text-[#888]">
            AssetTrack
          </span>
          <span className="font-mono text-xs text-[#3a3a3a]">/</span>
          <span className="font-mono text-xs tracking-widest uppercase text-[#f0ff44]">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-[#888] hidden sm:block">
            {currentUser}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 font-mono text-xs text-[#888] hover:text-[#ff4444] transition-colors uppercase tracking-widest"
            >
              <LogOut size={12} />
              Exit
            </button>
          </form>
        </div>
      </header>

      {/* Tab Nav */}
      <nav className="border-b border-[#1f1f1f] px-4 flex gap-0">
        <TabButton
          label="Deployment Log"
          icon={<Activity size={13} />}
          active={activeTab === "log"}
          onClick={() => setActiveTab("log")}
        />
        <TabButton
          label="Users"
          icon={<Users size={13} />}
          active={activeTab === "users"}
          onClick={() => setActiveTab("users")}
        />
      </nav>

      {/* Tab Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "log" && <LogTab />}
        {activeTab === "users" && <UsersTab />}
      </main>
    </div>
  );
}

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 font-mono text-xs tracking-widest uppercase border-b-2 transition-colors ${
        active
          ? "border-[#f0ff44] text-[#f0ff44]"
          : "border-transparent text-[#888] hover:text-[#f5f5f5]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
