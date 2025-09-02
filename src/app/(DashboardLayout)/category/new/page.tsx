"use client";

import {
  Container,
  Stack,
  TextField,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { useMemo, useState } from "react";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD") // drop accents
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewCategoryPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState("#1976d2");
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [tagHeader, setTagHeader] = useState("");
  const [tagFooter, setTagFooter] = useState("");

  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => {
    return name.trim().length > 0 && slug.trim().length > 0;
  }, [name, slug]);

  const handleSave = async () => {
    if (!isValid) {
      setError("Please fill in Name and Slug.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        slug: slugify(slug),
        color,
        description,
        metaTitle,
        metaDesc,
        canonicalUrl,
        tagHeader, // ✅ match API -> DB tag_header
        tagFooter, // ✅ match API -> DB tag_footer
      };

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to save category");
      }

      // Keep a copy for the dialog before clearing
      setSavedName(payload.name);
      setOpenModal(true);

      // reset form
      setName("");
      setSlug("");
      setColor("#1976d2");
      setDescription("");
      setMetaTitle("");
      setMetaDesc("");
      setCanonicalUrl("");
      setTagHeader("");
      setTagFooter("");
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const onNameChange = (val: string) => {
    setName(val);
    // auto-generate slug only if user hasn't typed a custom one yet
    if (!slug) setSlug(slugify(val));
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Create New Category
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          fullWidth
          required
        />

        <TextField
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          helperText="Lowercase URL-safe text, e.g. my-new-category"
          fullWidth
          required
        />

        <Box>
          <Typography sx={{ mb: 1 }}>Color</Typography>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: 50, height: 40, border: "none", cursor: "pointer" }}
          />
        </Box>

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          fullWidth
        />

        <TextField
          label="Meta Title"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          fullWidth
        />

        <TextField
          label="Meta Description"
          value={metaDesc}
          onChange={(e) => setMetaDesc(e.target.value)}
          multiline
          rows={2}
          fullWidth
        />

        <TextField
          label="Canonical URL"
          value={canonicalUrl}
          onChange={(e) => setCanonicalUrl(e.target.value)}
          placeholder="https://www.example.com/path"
          fullWidth
        />

        <TextField
          label="Header (Code Injection)"
          value={tagHeader}
          onChange={(e) => setTagHeader(e.target.value)}
          multiline
          rows={3}
          fullWidth
        />

        <TextField
          label="Footer (Code Injection)"
          value={tagFooter}
          onChange={(e) => setTagFooter(e.target.value)}
          multiline
          rows={3}
          fullWidth
        />

        {error && <Alert severity="error">{error}</Alert>}

        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading || !isValid}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </Stack>

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>🎉 Category Created</DialogTitle>
        <DialogContent>
          <Typography>
            The category &quot;{savedName}&quot; has been saved.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
