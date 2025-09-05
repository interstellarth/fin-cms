"use client";
import React, { useEffect, useMemo, useState } from "react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  timelineOppositeContentClasses,
} from "@mui/lab";
import { Box, Link, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

type ContentItem = {
  id: number;
  title: string;
  createdDate: string;
  status: string;
};

const RecentPosts: React.FC = () => {
  const theme = useTheme();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // Leverage existing API sorting by createdDate desc
        const res = await fetch(`/api/contents?limit=6`);
        if (!res.ok) throw new Error("Failed to load recent posts");
        const json = await res.json();
        const data = (json?.data ?? []) as ContentItem[];
        if (active) setItems(data);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Error");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const connectorColor = useMemo(
    () => (theme.palette.mode === "dark" ? "#374151" : "#efefef"),
    [theme.palette.mode]
  );

  const dotColor = (status: string):
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error" => {
    const s = status.toLowerCase();
    if (s.startsWith("publish")) return "success";
    if (s.startsWith("draft")) return "warning";
    if (s.startsWith("schedule")) return "secondary";
    return "primary";
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const t = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    return t.toLowerCase();
  };

  return (
    <DashboardCard title="Recent Post">
      {loading ? (
        <Box display="flex" alignItems="center" justifyContent="center" minHeight={180}>
          Loading…
        </Box>
      ) : error ? (
        <Box color="error.main" px={1} py={1}>
          {error}
        </Box>
      ) : items.length === 0 ? (
        <Box px={1} py={1}>No recent posts.</Box>
      ) : (
        <Timeline
          className="theme-timeline"
          sx={{
            p: 0,
            mb: "-40px",
            "& .MuiTimelineConnector-root": {
              width: "1px",
              backgroundColor: connectorColor,
            },
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.5,
              paddingLeft: 0,
            },
          }}
        >
          {items.map((it, idx) => (
            <TimelineItem key={it.id}>
              <TimelineOppositeContent>
                {formatTime(it.createdDate)}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={dotColor(it.status)} variant="outlined" />
                {idx !== items.length - 1 ? <TimelineConnector /> : null}
              </TimelineSeparator>
              <TimelineContent>
                <Typography fontWeight={600}>
                  <Link href={`/preview/${it.id}`} underline="none">
                    {it.title || "Untitled"}
                  </Link>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {it.status}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </DashboardCard>
  );
};

export default RecentPosts;

