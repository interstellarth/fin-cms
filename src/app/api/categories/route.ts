import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ORDER_COLUMN = "created_at";

function parseIntSafe(v: string | null, fallback: number) {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------- GET ----------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseIntSafe(searchParams.get("page"), 1);
    const limit = parseIntSafe(searchParams.get("limit"), 10);
    const search = (searchParams.get("search") || "").trim().replaceAll(",", " ");

    let q: any = supabase.from("categories");
    if (search) {
      q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const countRes = await q.select("*", { count: "exact", head: true }).throwOnError();
    const total = countRes.count ?? 0;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await q
      .select("*")
      .order(ORDER_COLUMN as any, { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Supabase fetch error:", {
        message: error.message,
        code: error.code,
        details: (error as any).details,
        hint: (error as any).hint,
      });
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }

    return NextResponse.json({
      data: data ?? [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error("❌ categories GET failed:", { message: err?.message ?? String(err), stack: err?.stack });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------- POST ----------
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
      tagHeader,
      tagFooter,
    } = body || {};

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

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
      return NextResponse.json({ error: "Failed to check category" }, { status: 500 });
    }
    if (existing) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }

    const insertPayload = {
      name,
      slug,
      color,
      description: description ?? null,
      meta_title: metaTitle ?? null,
      meta_description: metaDesc ?? null,
      canonical_url: canonicalUrl ?? null,
      tag_header: tagHeader ?? null,
      tag_footer: tagFooter ?? null,
      // created_at comes from DB default
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

    return NextResponse.json({ message: "Category created", data }, { status: 201 });
  } catch (err: any) {
    console.error("❌ categories POST failed:", { message: err?.message ?? String(err), stack: err?.stack });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
