import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }
    const idNum = Number(id);
    const { data, error } = await supabase
      .from("contents")
      .select("*")
      .eq("id", Number.isNaN(idNum) ? id : idNum)
      // Allow preview for any status. If you want only published, uncomment next line.
      // .eq("status", "Published")
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
