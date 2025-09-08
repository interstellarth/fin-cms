"use client";
import React, { useEffect, useMemo, useState } from "react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { Box, MenuItem, Select } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title as ChartTitle,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { Stack, Typography } from "@mui/material";

ChartJS.register(ArcElement, Tooltip, Legend, ChartTitle);

type Item = { id: number; name: string; count: number };

type Kind = "categories" | "tags";

const TopCategoriesTags: React.FC = () => {
  const theme = useTheme();
  const [kind, setKind] = useState<Kind>("categories");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/metrics/top?kind=${kind}&limit=6`);
        const json = (await res.json()) as { items: Item[] };
        if (active) setItems(json.items || []);
      } catch (e) {
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [kind]);

  const colors = useMemo(() => {
    const p = theme.palette.primary.main;
    const s = theme.palette.secondary.main;
    const w = theme.palette.warning.main;
    const i = theme.palette.info.main;
    const e = theme.palette.error.main;
    const g = theme.palette.success.main;
    return [p, s, w, i, e, g];
  }, [theme.palette]);

  const filtered = useMemo(() => items.filter((i) => (i.count ?? 0) > 0), [items]);

  const data = useMemo(() => ({
    labels: filtered.map((i) => i.name),
    datasets: [
      {
        label: kind === "categories" ? "Categories" : "Tags",
        data: filtered.map((i) => i.count),
        backgroundColor: filtered.map((_, idx) => colors[idx % colors.length]),
        borderWidth: 0,
      },
    ],
  }), [filtered, colors, kind]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false, text: "" },
      },
    }),
    []
  );

  return (
    <DashboardCard
      title={kind === "categories" ? "Top Categories" : "Top Tags"}
      action={
        <Box>
          <Select size="small" value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
            <MenuItem value="categories">Categories</MenuItem>
            <MenuItem value="tags">Tags</MenuItem>
          </Select>
        </Box>
      }
    >
      <Box height={320} display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={1.5}>
        {loading ? (
          <Box display="flex" height="100%" alignItems="center" justifyContent="center">Loading…</Box>
        ) : filtered.length === 0 ? (
          <Box display="flex" height="100%" alignItems="center" justifyContent="center" color="text.secondary">
            No data yet
          </Box>
        ) : (
          <>
            <Box sx={{ width: "100%", maxWidth: 240 }}>
              <Pie data={data} options={options} />
            </Box>
            {(() => {
              const total = filtered.reduce((s, x) => s + (x.count || 0), 0) || 1;
              return (
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 420,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    columnGap: 2,
                    rowGap: 1,
                    mt: 0.5,
                  }}
                >
                  {filtered.map((it, idx) => {
                    const color = colors[idx % colors.length];
                    const pct = Math.round(((it.count || 0) / total) * 100);
                    return (
                      <Box key={it.id} display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                        <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                          <Box sx={{ width: 10, height: 10, bgcolor: color, borderRadius: "50%" }} />
                          <Typography variant="body2" noWrap title={it.name}>
                            {it.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">{pct}%</Typography>
                      </Box>
                    );
                  })}
                </Box>
              );
            })()}
          </>
        )}
      </Box>
    </DashboardCard>
  );
};

export default TopCategoriesTags;
