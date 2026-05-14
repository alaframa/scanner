// components/auth/LoginForm.tsx

"use client";

import { useState, useTransition } from "react";
import { login } from "@/lib/actions/auth";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="pill-error px-4 py-3 rounded text-xs flex items-center gap-2"
          role="alert"
        >
          <span className="text-[#ff4444]">▲</span>
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label
            htmlFor="username"
            className="block text-xs text-[#888] mb-1.5 uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            required
            className="input-industrial w-full px-4 py-3 rounded text-sm"
            placeholder="field.tech"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs text-[#888] mb-1.5 uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="input-industrial w-full px-4 py-3 rounded text-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-accent w-full py-4 rounded text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "AUTHENTICATING..." : "SIGN IN →"}
      </button>
    </form>
  );
}
