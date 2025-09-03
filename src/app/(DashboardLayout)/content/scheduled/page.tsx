"use client";
import React, { useState } from "react";
import PageContainer from "../../components/container/PageContainer";
import { Box, Grid, CircularProgress, Alert } from "@mui/material";
import ContentListCore from "../../components/dashboard/ContentListCore";
import EditContentModal from "../../components/modal/EditContentModal";
import { useContent } from "../../../../utils/useContent";

const ScheduledScreen = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editContent, setEditContent] = useState<any>(null);

  // Fetch only scheduled content
  const { contents, loading, error, refetch } = useContent({
    status: "Scheduled",
  });

  const handleOnEdit = (id: number) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setEditContent(contents.find((content) => content.id === id));
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

  const handleOnCreate = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsModalOpen(true);
    setIsEditMode(false);
    setEditContent({
      title: "",
      textHtml: "",
      banner: "",
      status: "Scheduled",
      createdBy: user.username || "",
      createdDate: "",
      updatedBy: "",
      updatedDate: "",
    });
  };

  if (loading) {
    return (
      <PageContainer title="Scheduled" description="All Scheduled list">
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
      <PageContainer title="Scheduled" description="All Scheduled list">
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Scheduled" description="All Scheduled list">
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <ContentListCore
              title={"Scheduled"}
              contents={contents}
              onCreate={handleOnCreate}
              onEdit={handleOnEdit}
              onDelete={handleOnDelete}
              onPreview={handleOnPreview}
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
export default ScheduledScreen;
