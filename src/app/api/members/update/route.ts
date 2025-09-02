import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

// Back-compat endpoint: update the "users" table even though path is /api/members/update
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id: rawId, userId, name, email, password, role } = body || {};
    const id = rawId ?? userId;
    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (typeof name !== "undefined") updateData.username = name;
    if (typeof email !== "undefined") updateData.email = email;
    if (typeof role !== "undefined") updateData.role = role;
    if (password) {
      // hash password same as login/register (sha256)
      const hashed = crypto.createHash("sha256").update(password).digest("hex");
      updateData.password = hashed;
    }

    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from("users")
      .update(updateData)
      .eq("id", isNaN(Number(id)) ? id : Number(id))
      .select("id, username, email, role, createdDate, lastLogin")
      .maybeSingle();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Update not applied (possibly blocked by RLS or invalid id)" }, { status: 403 });
    }

    return NextResponse.json({ message: "User updated successfully", data });
  } catch (error: any) {
    console.error("Error updating user via members/update:", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}
