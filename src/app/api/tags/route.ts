import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ORDER_COLUMN = "created_at";

function toInt(v: string | null, def: number) {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : def;
}

// ---------- GET /api/tags ----------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page  = toInt(searchParams.get("page"), 1);
    const limit = toInt(searchParams.get("limit"), 10);
    const search = (searchParams.get("search") || "").trim().replaceAll(",", " ");

    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    const base = () => {
      let q: any = supabase.from("tags");
      if (search) {
        // @ts-ignore: .or exists at runtime
        q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      return q;
    };

    // Count (HEAD)
    const { count, error: countError } = await base().select("*", {
      count: "exact",
      head: true,
    });
    if (countError) {
      console.error("❌ Count error (tags):", countError);
      return NextResponse.json({ error: "Count failed" }, { status: 500 });
    }

    // Data ordered by a real column
    const { data, error } = await base()
      .select("*")
      .order(ORDER_COLUMN as any, { ascending: false })
      .range(from, to);

    if (error) {
      console.error("❌ Supabase fetch error (tags):", {
        message: error.message,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint,
      });
      return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (e: any) {
    console.error("❌ GET /tags failed:", e?.message ?? String(e));
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ---------- POST /api/tags ----------
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
      xTitle,
      xDesc,
      fbTitle,
      fbDesc,
      tagHeader,
      tagFooter,
    } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "Missing name or slug" }, { status: 400 });
    }

    // Build payload using existing DB columns only (no createdDate)
    const payload = {
      name,
      slug: String(slug).trim().toLowerCase(), // normalize to match index(lower(slug))
      color,
      description: description ?? null,
      meta_title: metaTitle ?? null,
      meta_description: metaDesc ?? null,
      canonical_url: canonicalUrl ?? null,
      x_title: xTitle ?? null,
      x_description: xDesc ?? null,
      fb_title: fbTitle ?? null,
      fb_description: fbDesc ?? null,
      tag_header: tagHeader ?? null,
      tag_footer: tagFooter ?? null,
      // created_at handled by DB default
    };

    const { data, error } = await supabase
      .from("tags")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      // Unique violation => 23505
      if ((error as any).code === "23505") {
        return NextResponse.json({ error: "Tag already exists" }, { status: 409 });
      }
      console.error("❌ Insert error (tags):", {
        message: error.message,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint,
      });
      return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
    }

    return NextResponse.json({ message: "Tag created successfully", data }, { status: 201 });
  } catch (e: any) {
    console.error("❌ POST /tags failed:", e?.message ?? String(e));
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
  }
}
