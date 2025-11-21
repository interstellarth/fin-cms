import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const rawStatus = searchParams.get("status") || "";

    // Normalize status texts from UI filters
    const normalizeStatus = (s: string) => {
      const t = s.trim().toLowerCase();
      if (!t || t === "all" || t === "all posts") return "";
      if (t.startsWith("draft")) return "Draft";
      if (t.startsWith("publish")) return "Published"; // publish, published, publishe
      if (t.startsWith("schedule")) return "Scheduled"; // schedule, scheduled
      return s; // fallback as-is
    };
    const status = normalizeStatus(rawStatus);

    let query = supabase.from("contents").select("*", { count: "exact" });

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Filter by search term
    if (search) {
      query = query.or(`title.ilike.%${search}%,textHtml.ilike.%${search}%`);
    }

    // Get total count first
    const { count } = await query;

    // Get paginated data
    const { data, error } = await query
      .order("createdDate", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch contents" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error fetching contents:", error);
    return NextResponse.json(
      { error: "Failed to fetch contents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      textHtml,
      banner,
      createdBy,
      description = "",
      metaTitle = "",
      metaDesc = "",
      canonicalUrl = "",
      xTitle = "",
      xDesc = "",
      fbTitle = "",
      fbDesc = "",
      tagHeader = "",
      tagFooter = "",
      status = "Draft",
    } = await req.json();

    if (!title || !textHtml || !createdBy) {
      return NextResponse.json(
        { error: "Title, content, and author are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("contents")
      .insert({
        title,
        textHtml,
        banner,
        description,
        metaTitle,
        metaDesc,
        canonicalUrl,
        xTitle,
        xDesc,
        fbTitle,
        fbDesc,
        tagHeader,
        tagFooter,
        createdBy,
        status,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create content" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Content created successfully",
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json(
      { error: "Failed to create content" },
      { status: 500 }
    );
  }
}
