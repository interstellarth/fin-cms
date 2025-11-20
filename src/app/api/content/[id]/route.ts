import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Context = { params: Promise<{ id: string }> };
async function readId(ctx: Context): Promise<string> {
  const params = (ctx as any)?.params;
  // Some Next releases passed params as a Promise; handle both shapes safely.
  if (params?.then) return (await params).id;
  return params?.id;
}

export async function PUT(req: NextRequest, ctx: Context) {
  try {
    const id = await readId(ctx);
    const idNum = Number(id);
    const { title, textHtml, banner, updatedBy, status } = await req.json();

    const { data: exists } = await supabase
      .from("contents")
      .select("id")
      .eq("id", Number.isNaN(idNum) ? id : idNum)
      .maybeSingle();
    if (!exists) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("contents")
      .update({ title, textHtml, banner, updatedBy, status, updatedDate: new Date().toISOString() })
      .eq("id", Number.isNaN(idNum) ? id : idNum)
      .select()
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Update not applied" }, { status: 400 });
    return NextResponse.json({ message: "Content updated successfully", data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to update content" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Context) {
  try {
    const id = await readId(ctx);
    const idNum = Number(id);
    const { data: exists } = await supabase
      .from("contents")
      .select("id")
      .eq("id", Number.isNaN(idNum) ? id : idNum)
      .maybeSingle();
    if (!exists) return NextResponse.json({ error: "Content not found" }, { status: 404 });

    const { error } = await supabase
      .from("contents")
      .delete()
      .eq("id", Number.isNaN(idNum) ? id : idNum);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: "Content deleted successfully" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to delete content" }, { status: 500 });
  }
}
