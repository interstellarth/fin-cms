import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Next.js 15 may provide `params` as a Promise — await it safely
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolved = (params as any)?.then ? await (params as any) : params;
    const id = Number(resolved.id);
    const body = await req.json();
    const {
      title,
      textHtml,
      banner,
      status,
      tag,
      category,
      tag_name,
      category_name,
      updatedBy,
    } = body;

    const updatePayload: any = {
      updatedDate: new Date().toISOString(),
    };
    if (typeof title !== "undefined") updatePayload.title = title;
    if (typeof textHtml !== "undefined") updatePayload.textHtml = textHtml;
    if (typeof banner !== "undefined") updatePayload.banner = banner;
    if (typeof status !== "undefined") updatePayload.status = status;
    if (typeof updatedBy !== "undefined") updatePayload.updatedBy = updatedBy;
    if (typeof tag !== "undefined" || typeof tag_name !== "undefined") {
      updatePayload.tag_name = (tag ?? tag_name) || null;
    }
    if (typeof category !== "undefined" || typeof category_name !== "undefined") {
      updatePayload.category_name = (category ?? category_name) || null;
    }

    const { data, error } = await supabase
      .from("contents")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolved = (params as any)?.then ? await (params as any) : params;
    const id = Number(resolved.id);
    const { error } = await supabase.from("contents").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolved = (params as any)?.then ? await (params as any) : params;
    const id = Number(resolved.id);
    const { data, error } = await supabase
      .from("contents")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}
