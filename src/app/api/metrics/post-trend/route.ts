import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Returns counts of posts per day and status for last N days
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = Math.max(1, Math.min(60, parseInt(searchParams.get("days") || "7", 10)));

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));

    // Fetch minimal fields within range
    const client = supabaseAdmin ?? supabase;
    const { data, error } = await client
      .from("contents")
      .select("id, status, createdDate")
      .gte("createdDate", start.toISOString())
      .lte("createdDate", end.toISOString())
      .order("createdDate", { ascending: true });

    if (error) {
      console.error("❌ post-trend fetch error:", error);
      return NextResponse.json({ labels: [], datasets: [] });
    }

    // Build date labels (local date string like 'Thu', 'Fri' if small, else MM/DD)
    const labels: string[] = [];
    const byDate: Record<string, { Published: number; Draft: number; Scheduled: number }> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const label = days <= 10 ? d.toLocaleDateString(undefined, { weekday: "short" }) : d.toLocaleDateString();
      labels.push(label);
      byDate[key] = { Published: 0, Draft: 0, Scheduled: 0 };
    }

    (data || []).forEach((row) => {
      const key = (row.createdDate as string).slice(0, 10);
      const status = (row.status as string) as "Published" | "Draft" | "Scheduled";
      if (byDate[key]) {
        if (status === "Published") byDate[key].Published++;
        else if (status === "Draft") byDate[key].Draft++;
        else if (status === "Scheduled") byDate[key].Scheduled++;
      }
    });

    const keysInOrder = Object.keys(byDate); // already constructed in order
    const pub = keysInOrder.map((k) => byDate[k].Published);
    const dra = keysInOrder.map((k) => byDate[k].Draft);
    const sch = keysInOrder.map((k) => byDate[k].Scheduled);

    return NextResponse.json({
      labels,
      datasets: [
        { label: "Published", data: pub },
        { label: "Draft", data: dra },
        { label: "Scheduled", data: sch },
      ],
    });
  } catch (e) {
    console.error("❌ post-trend error:", e);
    return NextResponse.json({ labels: [], datasets: [] });
  }
}
