// lib/actions/auth.ts

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function login(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
        return { error: "Username and password are required." };
    }

    const { data: user, error } = await supabase
        .from("users")
        .select("id, username, password_hash, role, is_active")
        .eq("username", username.trim().toLowerCase())
        .single();

    if (error || !user) return { error: "Invalid credentials." };
    if (!user.is_active) return { error: "Account disabled. Contact admin." };

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return { error: "Invalid credentials." };

    const token = await signToken({
        sub: user.id,
        username: user.username,
        role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("at_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24h
        path: "/",
    });

    redirect(user.role === "admin" ? "/admin" : "/app");
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("at_session");
    redirect("/login");
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("at_session")?.value;
    if (!token) return null;

    try {
        const payload = await verifyToken(token);
        return payload as { sub: string; username: string; role: string };
    } catch {
        return null;
    }
}
