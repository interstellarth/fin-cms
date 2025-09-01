import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Pick ONE canonical timestamp column that actually exists in your DB.
// If your table uses created_at (recommended), keep this.
// If not, switch to "createddate" or "created_date".
const ORDER_COLUMN = "created_at";

function parseIntSafe(v: string | null, fallback: number) {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ✅ GET: fetch categories with optional search + pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseIntSafe(searchParams.get("page"), 1);
    const limit = parseIntSafe(searchParams.get("limit"), 10);
    const search = (searchParams.get("search") || "").trim();

    // base query
    let q = supabase.from("categories");

    // filter
    if (search) {
      // name/description may be NULL, ilike handles fine
      // @ts-ignore supabase-js has .or at runtime
      q = (q as any).or(
        `name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // count (HEAD) — get accurate total without fetching rows
    const countRes = await q
      .select("*", { count: "exact", head: true })
      .throwOnError();
    const total = countRes.count ?? 0;

    // data
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Use an existing column for order. If ORDER_COLUMN doesn't exist,
    // this throws; change ORDER_COLUMN to a real column in your table.
    const { data, error } = await q
      .select("*")
      .order(ORDER_COLUMN as any, { ascending: false })
      .range(from, to);

    if (error) {
      // Log full details for PostgREST errors:
      console.error("Supabase fetch error:", {
        message: error.message,
        code: error.code,
        details: (error as any).details,
        hint: (error as any).hint,
      });
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data ?? [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error("❌ categories GET failed:", {
      message: err?.message ?? String(err),
      stack: err?.stack,
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ POST: insert new category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
    } = body || {};

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // check duplicates (name OR slug)
    const { data: existing, error: checkError } = await supabase
      .from("categories")
      .select("id")
      .or(`name.eq.${name},slug.eq.${slug}`)
      .maybeSingle();

    if (checkError) {
      console.error("Check existing error:", {
        message: checkError.message,
        code: checkError.code,
        details: (checkError as any).details,
        hint: (checkError as any).hint,
      });
      return NextResponse.json(
        { error: "Failed to check category" },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 }
      );
    }

    // Build payload with snake_case column names that actually exist.
    // IMPORTANT: Do NOT set createdDate here—use a DB default on created_at.
    const insertPayload = {
      name,
      slug,
      color,
      description,
      meta_title: metaTitle ?? null,
      meta_description: metaDesc ?? null,
      canonical_url: canonicalUrl ?? null,
      fb_title: fbTitle ?? null,
      fb_description: fbDesc ?? null,
      tag_header: tagHeader ?? null,
      tag_footer: tagFooter ?? null,
      // created_at handled by DB default (now())
    };

    const { data, error } = await supabase
      .from("categories")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      console.error("Insert error:", {
        message: error.message,
        code: error.code,
        details: (error as any).details,
        hint: (error as any).hint,
      });
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Category created", data },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ categories POST failed:", {
      message: err?.message ?? String(err),
      stack: err?.stack,
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
