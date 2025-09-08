"use client";
import React, { useEffect, useMemo, useState } from "react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { Box, MenuItem, Select } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title as ChartTitle,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ChartTitle
);

type TrendResponse = {
  labels: string[]; // e.g., ["Thu", "Fri", ...] or date strings
  datasets: { label: string; data: number[] }[];
};

const DEFAULT_DAYS = 7;

const PostTrend: React.FC = () => {
  const theme = useTheme();
  const [days, setDays] = useState<number>(DEFAULT_DAYS);
  const [trend, setTrend] = useState<TrendResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/metrics/post-trend?days=${days}`);
        const json = (await res.json()) as TrendResponse;
        if (active) setTrend(json);
      } catch (e) {
        if (active) setTrend({ labels: [], datasets: [] });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [days]);

  const palette = useMemo(() => {
    return {
      published: theme.palette.primary.main,
      draft: theme.palette.secondary.main,
      scheduled: theme.palette.warning.main,
    };
  }, [theme.palette]);

  const data = useMemo(() => {
    if (!trend) return { labels: [], datasets: [] };
    return {
      labels: trend.labels,
      datasets: trend.datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        borderColor:
          ds.label.toLowerCase().startsWith("publish")
            ? palette.published
            : ds.label.toLowerCase().startsWith("draft")
            ? palette.draft
            : palette.scheduled,
        backgroundColor:
          ds.label.toLowerCase().startsWith("publish")
            ? palette.published
            : ds.label.toLowerCase().startsWith("draft")
            ? palette.draft
            : palette.scheduled,
        fill: false,
        tension: 0.35,
        pointRadius: 4,
      })),
    };
  }, [trend, palette]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "bottom" as const },
        title: { display: false, text: "" },
        tooltip: { enabled: true },
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: theme.palette.divider }, beginAtZero: true, ticks: { precision: 0 } },
      },
    }),
    [theme.palette.divider]
  );

  return (
    <DashboardCard
      title="Post Trend"
      action={
        <Box>
          <Select size="small" value={String(days)} onChange={(e) => setDays(Number(e.target.value))}>
            <MenuItem value={"7"}>Last 7 days</MenuItem>
            <MenuItem value={"14"}>Last 14 days</MenuItem>
            <MenuItem value={"30"}>Last 30 days</MenuItem>
          </Select>
        </Box>
      }
    >
      <Box height={320}>
        {loading ? (
          <Box display="flex" height="100%" alignItems="center" justifyContent="center">Loading…</Box>
        ) : (
          <Line data={data} options={options} />
        )}
      </Box>
    </DashboardCard>
  );
};

export default PostTrend;

