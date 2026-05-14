// components/user/PasswordChangeForm.tsx

"use client";

import { useState, useTransition } from "react";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { changePassword } from "@/lib/actions/users";
import Link from "next/link";

interface Props {
  username: string;
  isAdmin: boolean;
}

interface FieldState {
  current: string;
  next: string;
  confirm: string;
}

interface ShowState {
  current: boolean;
  next: boolean;
  confirm: boolean;
}

const RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    id: "upper",
    label: "One uppercase letter",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    id: "lower",
    label: "One lowercase letter",
    test: (p: string) => /[a-z]/.test(p),
  },
  { id: "digit", label: "One number", test: (p: string) => /\d/.test(p) },
  {
    id: "special",
    label: "One special character",
    test: (p: string) => /[@$!%*?&#^()_+\-=]/.test(p),
  },
];

export function PasswordChangeForm({ username, isAdmin }: Props) {
  const [fields, setFields] = useState<FieldState>({
    current: "",
    next: "",
    confirm: "",
  });
  const [show, setShow] = useState<ShowState>({
    current: false,
    next: false,
    confirm: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const set =
    (key: keyof FieldState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFields((f) => ({ ...f, [key]: e.target.value }));
      setError(null);
    };

  const toggleShow = (key: keyof ShowState) =>
    setShow((s) => ({ ...s, [key]: !s[key] }));

  const rulesPassed = RULES.filter((r) => r.test(fields.next));
  const allPassed = rulesPassed.length === RULES.length;

  const handleSubmit = () => {
    setError(null);

    if (!fields.current && !isAdmin) {
      setError("Current password is required.");
      return;
    }
    if (!allPassed) {
      setError("New password does not meet all requirements.");
      return;
    }
    if (fields.next !== fields.confirm) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await changePassword({
        username,
        currentPassword: fields.current,
        newPassword: fields.next,
        skipCurrentCheck: isAdmin,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setFields({ current: "", next: "", confirm: "" });
      }
    });
  };

  return (
    <div className="w-full max-w-md">
      {/* Back link */}
      <Link
        href={isAdmin ? "/admin" : "/app"}
        className="flex items-center gap-1.5 font-mono text-xs text-[#888] hover:text-[#f5f5f5] transition-colors mb-8 uppercase tracking-widest"
      >
        <ArrowLeft size={12} />
        Back
      </Link>

      <div className="card-surface rounded-lg p-8">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-[#f0ff44]" />
            <span className="font-mono text-xs text-[#f0ff44] uppercase tracking-widest">
              Security
            </span>
          </div>
          <h1 className="font-mono text-lg font-bold text-[#f5f5f5] tracking-tight">
            Change Password
          </h1>
          <p className="font-mono text-xs text-[#888] mt-1">@{username}</p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-12 h-12 rounded-full bg-[rgba(68,255,136,0.12)] border border-[rgba(68,255,136,0.3)] flex items-center justify-center">
              <ShieldCheck size={20} className="text-[#44ff88]" />
            </div>
            <p className="font-mono text-sm text-[#44ff88] text-center">
              Password updated successfully.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="font-mono text-xs text-[#888] hover:text-[#f5f5f5] transition-colors uppercase tracking-widest mt-2"
            >
              Change again
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Current password — hidden for admin-initiated resets */}
            {!isAdmin && (
              <PasswordField
                label="Current Password"
                value={fields.current}
                show={show.current}
                onChange={set("current")}
                onToggle={() => toggleShow("current")}
                placeholder="Enter current password"
              />
            )}

            {/* New password */}
            <PasswordField
              label="New Password"
              value={fields.next}
              show={show.next}
              onChange={set("next")}
              onToggle={() => toggleShow("next")}
              placeholder="Min. 8 characters"
            />

            {/* Strength rules */}
            {fields.next.length > 0 && (
              <div className="grid grid-cols-1 gap-1 -mt-2">
                {RULES.map((rule) => {
                  const ok = rule.test(fields.next);
                  return (
                    <div key={rule.id} className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[10px] transition-colors ${
                          ok ? "text-[#44ff88]" : "text-[#3a3a3a]"
                        }`}
                      >
                        {ok ? "✓" : "○"}
                      </span>
                      <span
                        className={`font-mono text-[10px] transition-colors ${
                          ok ? "text-[#44ff88]" : "text-[#888]"
                        }`}
                      >
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Confirm */}
            <PasswordField
              label="Confirm New Password"
              value={fields.confirm}
              show={show.confirm}
              onChange={set("confirm")}
              onToggle={() => toggleShow("confirm")}
              placeholder="Repeat new password"
              hasError={
                fields.confirm.length > 0 && fields.next !== fields.confirm
              }
            />

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded bg-[rgba(255,68,68,0.08)] border border-[rgba(255,68,68,0.2)]">
                <AlertTriangle
                  size={12}
                  className="text-[#ff4444] flex-shrink-0"
                />
                <span className="font-mono text-xs text-[#ff4444]">
                  {error}
                </span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="btn-accent w-full py-3 rounded flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {isPending ? (
                <span className="animate-pulse">UPDATING...</span>
              ) : (
                "UPDATE PASSWORD"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  show,
  onChange,
  onToggle,
  placeholder,
  hasError,
}: {
  label: string;
  value: string;
  show: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggle: () => void;
  placeholder: string;
  hasError?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] uppercase tracking-widest text-[#888]">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          className={`input-industrial w-full px-3 py-2.5 rounded text-sm pr-10 ${
            hasError ? "border-[#ff4444]" : ""
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#f5f5f5] transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}
