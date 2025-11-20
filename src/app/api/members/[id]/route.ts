import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };
// In some Next.js versions, params can be a Promise. Await it to avoid warnings.
async function readId(ctx: Ctx): Promise<string> {
  const params = (ctx as any)?.params;
  if (params?.then) {
    const p = await params;
    return p.id;
  }
  return params?.id;
}

// Get a single member by id
export async function GET(_req: Request, ctx: Ctx) {
  const id = await readId(ctx);
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// Update a member by id
export async function PUT(req: Request, ctx: Ctx) {
  try {
    const id = await readId(ctx);
    const updates = await req.json();

    if (updates?.labels && typeof updates.labels === "string") {
      updates.labels = updates.labels.split(",").map((l: string) => l.trim());
    }

    const { data, error } = await supabase
      .from("members")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Delete a member by id
export async function DELETE(_req: Request, ctx: Ctx) {
  const id = await readId(ctx);
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: "Deleted" });
}
