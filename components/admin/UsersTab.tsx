// components/admin/UsersTab.tsx

"use client";

import { useEffect, useState, useTransition } from "react";
import { UserCheck, UserX, KeyRound, RefreshCw } from "lucide-react";
import {
  getAllUsers,
  toggleUserActive,
  resetUserPassword,
} from "@/lib/actions/users";

interface User {
  id: string;
  username: string;
  role: "admin" | "user";
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<{
    id: string;
    msg: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const flash = (id: string, msg: string) => {
    setActionMsg({ id, msg });
    setTimeout(() => setActionMsg(null), 2500);
  };

  const handleToggle = (user: User) => {
    startTransition(async () => {
      await toggleUserActive(user.id, !user.is_active);
      flash(user.id, user.is_active ? "Deactivated" : "Activated");
      await fetchUsers();
    });
  };

  const handleReset = (user: User) => {
    if (
      !window.confirm(
        `Reset password for "${user.username}" to default 123456aA@?`,
      )
    )
      return;

    startTransition(async () => {
      await resetUserPassword(user.id);
      flash(user.id, "Password reset");
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1f1f1f]">
        <span className="font-mono text-xs text-[#888] uppercase tracking-widest">
          {users.length} Users
        </span>
        <button
          onClick={fetchUsers}
          disabled={loading || isPending}
          className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded text-xs ml-auto"
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48 font-mono text-xs text-[#888] tracking-widest">
            LOADING...
          </div>
        ) : (
          <table className="w-full text-xs font-mono border-collapse">
            <thead className="sticky top-0 bg-[#0a0a0a] z-10">
              <tr className="border-b border-[#1f1f1f]">
                {[
                  "Username",
                  "Role",
                  "Status",
                  "Last Login",
                  "Created",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-[#888] tracking-widest uppercase text-[10px] whitespace-nowrap font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                const msg = actionMsg?.id === user.id ? actionMsg.msg : null;
                return (
                  <tr
                    key={user.id}
                    className={`border-b border-[#111] transition-colors ${
                      i % 2 === 0 ? "bg-[#0a0a0a]" : "bg-[#0c0c0c]"
                    } ${!user.is_active ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-3 text-[#f5f5f5] tracking-wider">
                      {user.username}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] tracking-widest uppercase font-semibold ${
                          user.role === "admin"
                            ? "bg-[rgba(240,255,68,0.12)] text-[#f0ff44]"
                            : "bg-[rgba(255,255,255,0.04)] text-[#888]"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] tracking-widest uppercase font-semibold ${
                          user.is_active ? "pill-success" : "pill-error"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#888] tabular-nums whitespace-nowrap">
                      {user.last_login ? (
                        new Date(user.last_login).toLocaleString()
                      ) : (
                        <span className="text-[#3a3a3a]">Never</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#3a3a3a] tabular-nums whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {msg ? (
                        <span className="font-mono text-[10px] text-[#44ff88] tracking-widest uppercase">
                          ✓ {msg}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggle(user)}
                            disabled={isPending}
                            title={
                              user.is_active
                                ? "Deactivate user"
                                : "Activate user"
                            }
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] tracking-widest uppercase font-semibold transition-colors disabled:opacity-40 ${
                              user.is_active
                                ? "bg-[rgba(255,68,68,0.08)] text-[#ff4444] hover:bg-[rgba(255,68,68,0.16)] border border-[rgba(255,68,68,0.2)]"
                                : "bg-[rgba(68,255,136,0.08)] text-[#44ff88] hover:bg-[rgba(68,255,136,0.16)] border border-[rgba(68,255,136,0.2)]"
                            }`}
                          >
                            {user.is_active ? (
                              <>
                                <UserX size={10} /> Disable
                              </>
                            ) : (
                              <>
                                <UserCheck size={10} /> Enable
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleReset(user)}
                            disabled={isPending}
                            title="Reset password to default"
                            className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] tracking-widest uppercase font-semibold bg-[rgba(255,170,0,0.08)] text-[#ffaa00] hover:bg-[rgba(255,170,0,0.16)] border border-[rgba(255,170,0,0.2)] transition-colors disabled:opacity-40"
                          >
                            <KeyRound size={10} /> Reset PW
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
