import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> };
async function readId(ctx: Ctx): Promise<string> {
  // Support both sync and async params
  // @ts-ignore
  if (ctx?.params?.then) return (await (ctx as any).params).id;
  return (ctx as any)?.params?.id;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const id = await readId(ctx);
    const idNum = Number(id);
    const { data, error } = await supabase
      .from("contents")
      .select("*")
      .eq("id", Number.isNaN(idNum) ? id : idNum)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const id = await readId(ctx);
    const idNum = Number(id);
    const body = await req.json();
    const { title, textHtml, banner, updatedBy, status } = body || {};

    // Check if content exists
    const { data: existingContent } = await supabase
      .from("contents")
      .select("id")
      .eq("id", Number.isNaN(idNum) ? id : idNum)
      .maybeSingle();

    if (!existingContent) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Update content
    // Build update object only with provided fields
    const updateData: Record<string, any> = { updatedDate: new Date().toISOString() };
    if (typeof title !== "undefined") updateData.title = title;
    if (typeof textHtml !== "undefined") updateData.textHtml = textHtml;
    if (typeof banner !== "undefined") updateData.banner = banner;
    if (typeof updatedBy !== "undefined") updateData.updatedBy = updatedBy;
    if (typeof status !== "undefined") updateData.status = status;

    const { data, error } = await supabase
      .from("contents")
      .update(updateData)
      .eq("id", Number.isNaN(idNum) ? id : idNum)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update content" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Update not applied" }, { status: 400 });
    }
    return NextResponse.json({ message: "Content updated successfully", data });
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const id = await readId(ctx);
    const idNum = Number(id);

    // Check if content exists
    const { data: existingContent } = await supabase
      .from("contents")
      .select("id")
      .eq("id", Number.isNaN(idNum) ? id : idNum)
      .maybeSingle();

    if (!existingContent) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Delete content
    const { error } = await supabase
      .from("contents")
      .delete()
      .eq("id", Number.isNaN(idNum) ? id : idNum);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to delete content" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json(
      { error: "Failed to delete content" },
      { status: 500 }
    );
  }
}
