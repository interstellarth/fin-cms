"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, IconButton, Select, MenuItem, Tooltip as MuiTooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title as ChartTitle,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { TbArrowsShuffle } from "react-icons/tb";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ChartTitle
);

type ChartKind = "bar" | "doughnut" | "line";

const STATUSES = ["Published", "Draft", "Scheduled"] as const;

const PostOverview = () => {
  const theme = useTheme();
  const [month, setMonth] = useState("1");
  const [chartKind, setChartKind] = useState<ChartKind>("bar");
  const [totals, setTotals] = useState<Record<string, number>>({
    Published: 0,
    Draft: 0,
    Scheduled: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTotals = useCallback(async () => {
    setLoading(true);
    try {
      const qs = "limit=1"; // only need the `total` value
      const [pub, dra, sch] = await Promise.all([
        fetch(`/api/contents?status=Published&${qs}`),
        fetch(`/api/contents?status=Draft&${qs}`),
        fetch(`/api/contents?status=Scheduled&${qs}`),
      ]);

      const pr = await pub.json();
      const dr = await dra.json();
      const sc = await sch.json();

      setTotals({
        Published: pr?.total ?? 0,
        Draft: dr?.total ?? 0,
        Scheduled: sc?.total ?? 0,
      });
    } catch (e) {
      // ignore and keep zeroed totals
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  const colors = useMemo(() => {
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;
    const warning = theme.palette.warning.main;
    return [primary, secondary, warning];
  }, [theme.palette]);

  const labels = STATUSES as unknown as string[];
  const values = labels.map((l) => totals[l] ?? 0);

  const commonOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "bottom" as const },
      title: { display: false, text: "" },
      tooltip: { enabled: true },
    },
    scales: chartKind === "doughnut" ? undefined : {
      x: { grid: { display: false } },
      y: { grid: { color: theme.palette.divider }, beginAtZero: true, ticks: { precision: 0 } },
    },
  }), [chartKind, theme.palette.divider]);

  const barData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: "Posts",
        data: values,
        backgroundColor: colors,
        borderRadius: 6,
      },
    ],
  }), [labels, values, colors]);

  const doughnutData = barData;
  const lineData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: "Posts",
        data: values,
        borderColor: colors[0],
        backgroundColor: colors[0],
        fill: false,
        tension: 0.3,
        pointRadius: 5,
      },
    ],
  }), [labels, values, colors]);

  const handleCycleChart = () => {
    setChartKind((prev) => (prev === "bar" ? "doughnut" : prev === "doughnut" ? "line" : "bar"));
  };

  return (
    <DashboardCard
      title="Post Overview"
      action={
        <Box display="flex" alignItems="center" gap={1}>
          <Select
            labelId="month-dd"
            id="month-dd"
            value={month}
            size="small"
            onChange={(e) => setMonth(String(e.target.value))}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value={"1"}>This Month</MenuItem>
            <MenuItem value={"2"}>Last Month</MenuItem>
            <MenuItem value={"3"}>Last 3 Months</MenuItem>
          </Select>
          <MuiTooltip title="Cycle chart type">
            <IconButton aria-label="cycle-chart" onClick={handleCycleChart} size="small">
              <TbArrowsShuffle />
            </IconButton>
          </MuiTooltip>
        </Box>
      }
    >
      <Box height={370} onClick={handleCycleChart} sx={{ cursor: "pointer" }}>
        {loading ? (
          <Box display="flex" height="100%" alignItems="center" justifyContent="center">Loading…</Box>
        ) : chartKind === "bar" ? (
          <Bar data={barData} options={commonOptions} />
        ) : chartKind === "doughnut" ? (
          <Doughnut data={doughnutData} options={commonOptions} />
        ) : (
          <Line data={lineData} options={commonOptions} />
        )}
      </Box>
    </DashboardCard>
  );
};

export default PostOverview;

