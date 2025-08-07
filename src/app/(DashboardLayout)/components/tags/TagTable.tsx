"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
} from "@mui/material";

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  post_count: number; // ✅ เพิ่ม count
}

export default function TagTable() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch("/api/tags");
        if (!res.ok) throw new Error(`Error: ${res.statusText}`);
        const json = await res.json();

        if (!json.data || !Array.isArray(json.data)) {
          throw new Error("Invalid data format from API");
        }

        setTags(json.data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchTags();
  }, []);

  if (loading) return <Typography>Loading tags...</Typography>;
  if (error) return <Typography color="error">Failed to load tags: {error}</Typography>;
  if (tags.length === 0) return <Typography>No tags found.</Typography>;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Slug</strong></TableCell>
            <TableCell><strong>Color</strong></TableCell>
            <TableCell><strong>Description</strong></TableCell>
            <TableCell align="right"><strong>Post Count</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tags.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell>{tag.name}</TableCell>
              <TableCell>{tag.slug}</TableCell>
              <TableCell>
                <Chip
                  label={tag.color}
                  sx={{
                    backgroundColor: tag.color,
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                />
              </TableCell>
              <TableCell>{tag.description || "-"}</TableCell>
              <TableCell align="right">{tag.post_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
