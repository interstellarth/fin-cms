import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ✅ GET: Fetch categories with optional search, pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search")?.toLowerCase() || "";

    let baseQuery = supabase.from("categories");

    // 🔍 Filtering
    if (search) {
      // @ts-ignore: 'or' is available at runtime
      baseQuery = (baseQuery as any).or(
        `name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // 🧮 Count total
    const countRes = await baseQuery.select("*", {
      count: "exact",
      head: true,
    });

    if (countRes.error) {
      console.error("Count error:", countRes.error.message);
      return NextResponse.json(
        { error: "Failed to count categories" },
        { status: 500 }
      );
    }

    const total = countRes.count || 0;

    // 📦 Fetch paginated data
    const { data, error } = await baseQuery
      .select("*")
      .order("created_at", { ascending: false }) // ✅ Use correct column
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error("Fetch error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error("GET categories failed:", err.message || err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ✅ POST: Create new category
export async function POST(req: NextRequest) {
  try {
    const {
      name,
      slug,
      color = "#1976d2",
      description,
      metaTitle,
      metaDesc,
      canonicalUrl,
      fbTitle,
      fbDesc,
      tagHeader,
      tagFooter,
    } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // 🔄 Check for duplicate
    const { data: existing, error: checkError } = await supabase
      .from("categories")
      .select("id")
      .or(`name.eq.${name},slug.eq.${slug}`)
      .maybeSingle();

    if (checkError) {
      console.error("Check existing error:", checkError.message);
      return NextResponse.json(
        { error: "Failed to check existing category" },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 }
      );
    }

    const insertPayload = {
      name,
      slug,
      color,
      description,
      meta_title: metaTitle,
      meta_description: metaDesc,
      canonical_url: canonicalUrl,
      fb_title: fbTitle,
      fb_description: fbDesc,
      tag_header: tagHeader,
      tag_footer: tagFooter,
      created_at: new Date().toISOString(), // ✅ Match Supabase column
    };

    // ➕ Insert category
    const { data, error } = await supabase
      .from("categories")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error.message);
      return NextResponse.json(
        { error: "Failed to insert category" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Category created", data },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST categories failed:", err.message || err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
