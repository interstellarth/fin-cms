"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";

interface CategoryPostCount {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  post_count: number;
}

const PostCountByCategoryTable = () => {
  const [categories, setCategories] = useState<CategoryPostCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/post-count/categories");
        if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
        const json = await res.json();
        setCategories(json.data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Slug</strong></TableCell>
            <TableCell><strong>Post Count</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map(cat => (
            <TableRow key={cat.id}>
              <TableCell>{cat.name}</TableCell>
              <TableCell>{cat.slug}</TableCell>
              <TableCell>{cat.post_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PostCountByCategoryTable;
