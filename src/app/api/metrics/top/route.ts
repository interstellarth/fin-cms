import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kind = (searchParams.get("kind") || "categories").toLowerCase();
    const limit = Math.max(1, Math.min(10, parseInt(searchParams.get("limit") || "6", 10)));

    if (kind !== "categories" && kind !== "tags") {
      return NextResponse.json({ items: [] });
    }

    const client = supabaseAdmin ?? supabase;

    if (kind === "categories") {
      // Fetch all category relations and count in JS
      let counts: Record<number, number> = {};
      // First try many-to-many table
      const relsRes = await client
        .from("content_categories")
        .select("*");
      if (!relsRes.error && Array.isArray(relsRes.data)) {
        (relsRes.data || []).forEach((r: any) => {
          const id = (r.categoryid ?? r.categoryId ?? r.category_id) as number;
          if (id != null) counts[id] = (counts[id] || 0) + 1;
        });
      } else {
        // Fallback: try single FK column on contents
        const contRes = await client
          .from("contents")
          .select("categoryid, categoryId, category_id");
        if (!contRes.error && Array.isArray(contRes.data)) {
          contRes.data.forEach((r: any) => {
            const id = (r.categoryid ?? r.categoryId ?? r.category_id) as number;
            if (id != null) counts[id] = (counts[id] || 0) + 1;
          });
        }
      }
      if (Object.keys(counts).length === 0) {
        // Fallback to prebuilt views, if any
        const viewNames = [
          "post_count_by_category",
          "category_post_count",
          "category_with_post_count",
        ];
        for (const view of viewNames) {
          const v = await client.from(view).select("*");
          if (!v.error && Array.isArray(v.data) && v.data.length) {
            const items = (v.data as any[])
              .map((r) => {
                const name = r.name ?? r.category_name ?? r.title ?? r.label;
                const cnt = r.post_count ?? r.posts_count ?? r.count ?? r.total;
                const id = r.category_id ?? r.id;
                if (name == null || cnt == null) return null;
                return { id: Number(id ?? 0) || 0, name: String(name), count: Number(cnt) || 0 };
              })
              .filter(Boolean) as { id: number; name: string; count: number }[];
            return NextResponse.json({ items: items.sort((a,b)=>b.count-a.count).slice(0, limit) });
          }
        }
      }

      const ids = Object.keys(counts).map((s) => parseInt(s, 10));
      if (ids.length === 0) return NextResponse.json({ items: [] });

      const { data: cats, error: catErr } = await client
        .from("categories")
        .select("id, name")
        .in("id", ids);
      if (catErr) {
        console.error("❌ categories fetch error:", catErr);
        return NextResponse.json({ items: [] });
      }
      const items = (cats || [])
        .map((c) => ({ id: c.id as number, name: c.name as string, count: counts[c.id as number] || 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
      return NextResponse.json({ items });
    } else {
      // tags
      let counts: Record<number, number> = {};
      const relsRes = await client
        .from("content_tags")
        .select("*");
      if (!relsRes.error && Array.isArray(relsRes.data)) {
        (relsRes.data || []).forEach((r: any) => {
          const id = (r.tagid ?? r.tagId ?? r.tag_id) as number;
          if (id != null) counts[id] = (counts[id] || 0) + 1;
        });
      } else {
        // Fallback: try single FK on contents
        const contRes = await client
          .from("contents")
          .select("tagid, tagId, tag_id");
        if (!contRes.error && Array.isArray(contRes.data)) {
          contRes.data.forEach((r: any) => {
            const id = (r.tagid ?? r.tagId ?? r.tag_id) as number;
            if (id != null) counts[id] = (counts[id] || 0) + 1;
          });
        }
      }
      if (Object.keys(counts).length === 0) {
        const viewNames = [
          "post_count_by_tag",
          "tag_post_count",
          "tags_with_post_count",
        ];
        for (const view of viewNames) {
          const v = await client.from(view).select("*");
          if (!v.error && Array.isArray(v.data) && v.data.length) {
            const items = (v.data as any[])
              .map((r) => {
                const name = r.name ?? r.tag_name ?? r.title ?? r.label;
                const cnt = r.post_count ?? r.posts_count ?? r.count ?? r.total;
                const id = r.tag_id ?? r.id;
                if (name == null || cnt == null) return null;
                return { id: Number(id ?? 0) || 0, name: String(name), count: Number(cnt) || 0 };
              })
              .filter(Boolean) as { id: number; name: string; count: number }[];
            return NextResponse.json({ items: items.sort((a,b)=>b.count-a.count).slice(0, limit) });
          }
        }
      }

      const ids = Object.keys(counts).map((s) => parseInt(s, 10));
      if (ids.length === 0) return NextResponse.json({ items: [] });

      const { data: tags, error: tagErr } = await client
        .from("tags")
        .select("id, name")
        .in("id", ids);
      if (tagErr) {
        console.error("❌ tags fetch error:", tagErr);
        return NextResponse.json({ items: [] });
      }
      const items = (tags || [])
        .map((t) => ({ id: t.id as number, name: t.name as string, count: counts[t.id as number] || 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
      return NextResponse.json({ items });
    }
  } catch (e) {
    console.error("❌ metrics/top error:", e);
    return NextResponse.json({ items: [] });
  }
}
