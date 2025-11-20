"use client";
import { useEffect, useState } from "react";

type Params = { id: string };

export default function PreviewPage({ params }: { params: Promise<Params> }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { id } = await params;
        const res = await fetch(`/api/public/contents/detail?id=${encodeURIComponent(id)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load");
        if (active) setData(json.data);
      } catch (e: any) {
        if (active) setError(e?.message || "Failed to load");
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [params]);

  if (error) return <div style={{ padding: 24 }}>Preview error: {error}</div>;
  if (!data) return <div style={{ padding: 24 }}>Loading preview…</div>;

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>{data.title}</h1>
      {data.banner ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.banner} alt="banner" style={{ width: "100%", borderRadius: 8, marginBottom: 16 }} />
      ) : null}
      <div dangerouslySetInnerHTML={{ __html: data.textHtml || "" }} />
    </div>
  );
}
