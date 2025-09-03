import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> };
async function readId(ctx: Ctx): Promise<string> {
  // @ts-ignore - some Next versions pass a Promise
  if (ctx?.params?.then) return (await (ctx as any).params).id;
  return (ctx as any)?.params?.id;
}

export async function PUT(req: NextRequest, ctx: Ctx) {
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

export async function DELETE(_req: NextRequest, ctx: Ctx) {
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

