// lib/actions/deployments.ts

"use server";

import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function getDeploymentLog() {
    const session = await getSession();
    if (!session || session.role !== "admin") throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("deployments")
        .select(
            "id, serial, asset_tag, desk_number, location, assigned_to, deployed_by, mode, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(1000);

    if (error) throw new Error(error.message);
    return data ?? [];
}