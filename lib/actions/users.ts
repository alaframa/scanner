// lib/actions/users.ts

"use server";

import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

const DEFAULT_PASSWORD = "123456aA@";

// ─── Admin: Get all users ────────────────────────────────────────────────────

export async function getAllUsers() {
    const session = await getSession();
    if (!session || session.role !== "admin") throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("users")
        .select("id, username, role, is_active, created_at, last_login")
        .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
}

// ─── Admin: Toggle user active status ───────────────────────────────────────

export async function toggleUserActive(userId: string, isActive: boolean) {
    const session = await getSession();
    if (!session || session.role !== "admin") throw new Error("Unauthorized");

    const { error } = await supabase
        .from("users")
        .update({ is_active: isActive })
        .eq("id", userId);

    if (error) throw new Error(error.message);
}

// ─── Admin: Reset user password to default ──────────────────────────────────

export async function resetUserPassword(userId: string) {
    const session = await getSession();
    if (!session || session.role !== "admin") throw new Error("Unauthorized");

    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

    const { error } = await supabase
        .from("users")
        .update({ password_hash: hash })
        .eq("id", userId);

    if (error) throw new Error(error.message);
}

// ─── Self-service: Change own password ──────────────────────────────────────

interface ChangePasswordArgs {
    username: string;
    currentPassword: string;
    newPassword: string;
    skipCurrentCheck: boolean;
}

export async function changePassword({
    username,
    currentPassword,
    newPassword,
    skipCurrentCheck,
}: ChangePasswordArgs): Promise<{ error?: string }> {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Non-admins can only change their own password
    if (session.role !== "admin" && session.username !== username) {
        return { error: "Unauthorized" };
    }

    const { data: user, error: fetchErr } = await supabase
        .from("users")
        .select("id, password_hash")
        .eq("username", username)
        .single();

    if (fetchErr || !user) return { error: "User not found" };

    // Verify current password unless admin is skipping
    if (!skipCurrentCheck) {
        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) return { error: "Current password is incorrect." };
    }

    // Validate new password strength
    const strong =
        newPassword.length >= 8 &&
        /[A-Z]/.test(newPassword) &&
        /[a-z]/.test(newPassword) &&
        /\d/.test(newPassword) &&
        /[@$!%*?&#^()_+\-=]/.test(newPassword);

    if (!strong) return { error: "New password does not meet requirements." };

    const newHash = await bcrypt.hash(newPassword, 12);

    const { error: updateErr } = await supabase
        .from("users")
        .update({ password_hash: newHash })
        .eq("id", user.id);

    if (updateErr) return { error: "Failed to update password." };

    return {};
}