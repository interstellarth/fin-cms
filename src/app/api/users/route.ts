import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const email = searchParams.get("email");
  const username = searchParams.get("username");

  if (id || email || username) {
    let q = supabase.from("users").select("id, username, email, role, createdDate, lastLogin");
    if (id) q = q.eq("id", id);
    if (email) q = q.eq("email", email);
    if (username) q = q.eq("username", username);

    // return single if any filter present
    const { data, error } = await q.maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, username, email, role, createdDate, lastLogin");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
