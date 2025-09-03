"use client";
import React, { useEffect, useState } from "react";
import PageContainer from "../../components/container/PageContainer";
import {
  Box,
  Grid,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import ContentListCore from "../../components/dashboard/ContentListCore";
import EditContentModal from "../../components/modal/EditContentModal";
import { useContent } from "../../../../utils/useContent";

const PostsScreen = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editContent, setEditContent] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState(""); // '' means All posts

  // Fetch content with status filter
  const { contents, loading, error, refetch: refetchHook } = useContent({
    status: statusFilter,
  });
  // Refetch with status argument
  const refetch = (status?: string) => {
    const override = status ?? '';
    try { console.debug('[Posts] refetch called, override:', override); } catch {}
    setStatusFilter(override);
    refetchHook(override);
  };

  // Ensure a fetch runs when filter changes (especially switching back to All posts)
  useEffect(() => {
    try { console.debug('[Posts] statusFilter changed ->', statusFilter); } catch {}
    refetchHook(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleOnEdit = (id: number) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setEditContent(contents.find((content) => content.id === id));
  };

  const handleOnCreate = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsModalOpen(true);
    setIsEditMode(false);
    setEditContent({
      title: "",
      textHtml: "",
      banner: "",
      status: "Draft",
      createdBy: user.username || "",
      createdDate: "",
      updatedBy: "",
      updatedDate: "",
    });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditContent(null);
  };

  const handleModalSave = async () => {
    if (isEditMode && editContent?.id) {
      // Update existing content
      await fetch(`/api/contents/${editContent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editContent),
      });
    } else {
      // Create new content
      await fetch("/api/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editContent),
      });
    }
    setIsModalOpen(false);
    refetch(); // Refresh data after save
  };

  const handleChange = (field: string, value: string | number) => {
    setEditContent({ ...editContent, [field]: value });
  };

  const handleOnDelete = async (id: number) => {
    await fetch(`/api/contents/${id}`, {
      method: "DELETE",
    });
    refetch(); // Refresh data after delete
  };

  const handleOnPreview = (id: number) => {
    window.open(`/preview/${id}`, "_blank");
  };

  if (loading) {
    return (
      <PageContainer title="Posts" description="All Posts list">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Posts" description="All Posts list">
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Posts" description="All Posts list">
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <ContentListCore
              title={"Posts"}
              contents={contents}
              filterValue={statusFilter ? statusFilter : 'ALL'}
              onFilterChange={(v) => {
                const override = v === 'ALL' ? '' : v;
                setStatusFilter(override);
                refetchHook(override);
              }}
              onCreate={handleOnCreate}
              onEdit={handleOnEdit}
              onDelete={handleOnDelete}
              onPreview={handleOnPreview}
              refetch={refetch}
            />
          </Grid>
        </Grid>
      </Box>
      <EditContentModal
        open={isModalOpen}
        content={editContent}
        isEditMode={isEditMode}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onChange={handleChange}
      />
    </PageContainer>
  );
};
export default PostsScreen;
