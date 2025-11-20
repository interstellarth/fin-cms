import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

type Ctx = { params: Promise<{ id: string }> };
async function readId(ctx: Ctx): Promise<string> {
  const params = (ctx as any)?.params;
  // Support Next.js where params can be a promise
  if (params?.then) return (await params).id;
  return params?.id;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const id = await readId(ctx);
  const idNum = Number(id);
  const client = supabaseAdmin || supabase;
  const { data, error } = await client
    .from("users")
    .select("id, username, email, role, createdDate, lastLogin")
    .eq("id", Number.isNaN(idNum) ? id : idNum)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const id = await readId(ctx);
    const idNum = Number(id);
    const body = await req.json();
    const { username, email, password, role } = body || {};

    const updateData: any = {};
    if (typeof username !== "undefined") updateData.username = username;
    if (typeof email !== "undefined") updateData.email = email;
    if (typeof role !== "undefined") updateData.role = role;
    if (password) updateData.password = hashPassword(password);

    // Use update only (avoid UPSERT to respect RLS INSERT policy)
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from("users")
      .update(updateData)
      .eq("id", Number.isNaN(idNum) ? id : idNum)
      .select("id, username, email, role, createdDate, lastLogin")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      // Most likely blocked by RLS or record not matched
      return NextResponse.json({ error: "Update not applied (possibly blocked by RLS or invalid id)" }, { status: 403 });
    }
    return NextResponse.json({ message: "User updated successfully", data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to update user" }, { status: 500 });
  }
}
