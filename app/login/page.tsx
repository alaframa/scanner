// app/login/page.tsx

import { LoginForm } from "@/components/auth/LoginForm";
import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/app");

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      {/* Grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#f0ff44 1px, transparent 1px), linear-gradient(90deg, #f0ff44 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo / Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-8 h-8 flex-shrink-0"
              style={{
                background: "#f0ff44",
                clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
              }}
            />
            <span
              className="text-xs tracking-[0.3em] uppercase text-[#888]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              AssetTrack V2
            </span>
          </div>
          <h1
            className="text-3xl font-bold text-[#f5f5f5] leading-tight"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            FIELD
            <br />
            <span style={{ color: "#f0ff44" }}>ACCESS</span>
          </h1>
          <p
            className="mt-2 text-[#888] text-sm"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            IT Asset Deployment System
          </p>
        </div>

        <LoginForm />

        {/* Footer */}
        <p
          className="mt-8 text-center text-[#3a3a3a] text-xs"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          INTERNAL USE ONLY · IT DEPARTMENT
        </p>
      </div>
    </main>
  );
}
