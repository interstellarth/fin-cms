import {
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Button,
  Stack,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from "@mui/material";
import {
  IconTrash,
  IconPlus,
  IconEdit,
  IconChartBar,
  IconPencil,
  IconDots,
  IconEye,
} from "@tabler/icons-react";
import DashboardCard from "@/app/(DashboardLayout)//components/shared/DashboardCard";
import { useState } from "react";
import EditContentModal from "../modal/EditContentModal";

// Helper for 'time ago' (simple version)
function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "a few seconds ago";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export const contentItems = [
  {
    id: 1,
    title: "Getting Started with React",
    textHtml: "<p>Learn the basics of React development...</p>",
    banner: "/images/products/s4.jpg",
    createdBy: "John Doe",
    createdDate: "2023-09-14",
    updatedBy: "John Doe",
    updatedDate: "2023-09-15",
    status: "Published",
  },
  {
    id: 2,
    title: "Advanced TypeScript Patterns",
    textHtml: "<p>Master advanced TypeScript concepts...</p>",
    banner: "/images/products/s5.jpg",
    createdBy: "Jane Smith",
    createdDate: "2023-09-14",
    updatedBy: "Jane Smith",
    updatedDate: "2023-09-16",
    status: "Draft",
  },
  {
    id: 3,
    title: "CSS Grid Layout Mastery",
    textHtml: "<p>Complete guide to CSS Grid layouts...</p>",
    banner: "/images/products/s7.jpg",
    createdBy: "Mike Johnson",
    createdDate: "2023-09-14",
    updatedBy: "Mike Johnson",
    updatedDate: "2023-09-14",
    status: "Scheduled",
  },
  {
    id: 4,
    title: "State Management with Redux",
    textHtml: "<p>Understanding Redux state management...</p>",
    banner: "/images/products/s11.jpg",
    createdBy: "Sarah Wilson",
    createdDate: "2023-09-14",
    updatedBy: "Sarah Wilson",
    updatedDate: "2023-09-17",
    status: "Published",
  },
  {
    id: 5,
    title: "Next.js Best Practices",
    textHtml: "<p>Learn the best practices for Next.js development...</p>",
    banner: "/images/products/s4.jpg",
    createdBy: "Alex Brown",
    createdDate: "2023-09-18",
    updatedBy: "Alex Brown",
    updatedDate: "2023-09-18",
    status: "Scheduled",
  },
  {
    id: 6,
    title: "CSS Flexbox Complete Guide",
    textHtml: "<p>Master CSS Flexbox layout techniques...</p>",
    banner: "/images/products/s5.jpg",
    createdBy: "Emma Davis",
    createdDate: "2023-09-19",
    updatedBy: "Emma Davis",
    updatedDate: "2023-09-19",
    status: "Draft",
  },
  {
    id: 7,
    title: "JavaScript ES6+ Features",
    textHtml: "<p>Explore modern JavaScript features...</p>",
    banner: "/images/products/s7.jpg",
    createdBy: "Chris Wilson",
    createdDate: "2023-09-20",
    updatedBy: "Chris Wilson",
    updatedDate: "2023-09-20",
    status: "Published",
  },
  {
    id: 8,
    title: "React Hooks Deep Dive",
    textHtml: "<p>Understanding React Hooks in detail...</p>",
    banner: "/images/products/s11.jpg",
    createdBy: "Lisa Chen",
    createdDate: "2023-09-21",
    updatedBy: "Lisa Chen",
    updatedDate: "2023-09-21",
    status: "Published",
  },
  {
    id: 9,
    title: "Web Performance Optimization",
    textHtml: "<p>Techniques for optimizing web performance...</p>",
    banner: "/images/products/s4.jpg",
    createdBy: "Mark Taylor",
    createdDate: "2023-09-22",
    updatedBy: "Mark Taylor",
    updatedDate: "2023-09-22",
    status: "Draft",
  },
  {
    id: 10,
    title: "API Design Principles",
    textHtml: "<p>Best practices for designing RESTful APIs...</p>",
    banner: "/images/products/s5.jpg",
    createdBy: "Rachel Green",
    createdDate: "2023-09-23",
    updatedBy: "Rachel Green",
    updatedDate: "2023-09-23",
    status: "Scheduled",
  },
];

const statusColor = (status: string) => {
  switch (status) {
    case "Scheduled":
      return "success";
    case "Draft":
      return "error";
    case "Published":
      return "default";
    default:
      return "default";
  }
};

const ContentList = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContentId, setSelectedContentId] = useState<number | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editContent, setEditContent] = useState<any>(null);
  const [contents, setContents] = useState(contentItems);

  // Filters (dummy, not functional)
  const [postFilter, setPostFilter] = useState("All posts");
  const [accessFilter, setAccessFilter] = useState("All access");
  const [authorFilter, setAuthorFilter] = useState("All authors");
  const [tagFilter, setTagFilter] = useState("All tags");
  const [sortFilter, setSortFilter] = useState("Newest first");

  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedContentId(id);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedContentId(null);
  };
  const handleCreate = () => {
    setIsEditMode(false);
    setEditContent({
      title: "",
      textHtml: "",
      banner: "",
      status: "Draft",
      description: "",
      metaTitle: "",
      metaDesc: "",
      canonicalUrl: "",
      xTitle: "",
      xDesc: "",
      fbTitle: "",
      fbDesc: "",
      tagHeader: "",
      tagFooter: "",
    });
    setIsModalOpen(true);
  };
  const handleEdit = (id: number) => {
    const content = contents.find((c) => c.id === id);
    if (content) {
      setIsEditMode(true);
      setEditContent({ ...content });
      setIsModalOpen(true);
    }
    handleClose();
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditContent(null);
    setIsEditMode(false);
  };
  const handleModalSave = () => {
    if (isEditMode) {
      setContents((prev) =>
        prev.map((item) => (item.id === editContent.id ? editContent : item))
      );
    } else {
      const newContent = {
        ...editContent,
        id: Math.max(...contents.map((c) => c.id)) + 1,
        createdBy: "Current User",
        createdDate: new Date().toISOString(),
        updatedBy: "Current User",
        updatedDate: new Date().toISOString(),
      };
      setContents((prev) => [...prev, newContent]);
    }
    setIsModalOpen(false);
    setEditContent(null);
    setIsEditMode(false);
  };
  const handleChange = (field: string, value: string | number) => {
    setEditContent((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleDelete = (id: number) => {
    setContents((prev) => prev.filter((item) => item.id !== id));
    handleClose();
  };
  const handlePreview = (id: number) => {
    //TODO: Implement preview
  };

  return (
    <DashboardCard
      title="Posts"
      action={
        <>
          <Stack
            direction="row"
            spacing={1}
            mb={3}
            flexWrap="wrap"
            alignItems="center"
          >
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={postFilter}
                onChange={(e) => setPostFilter(e.target.value)}
              >
                <MenuItem value="All posts">All posts</MenuItem>
                <MenuItem value="Drafts">Drafts</MenuItem>
                <MenuItem value="Scheduled">Scheduled</MenuItem>
                <MenuItem value="Published">Published</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={accessFilter}
                onChange={(e) => setAccessFilter(e.target.value)}
              >
                <MenuItem value="All access">All access</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
              >
                <MenuItem value="All authors">All authors</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              >
                <MenuItem value="All tags">All tags</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
              >
                <MenuItem value="Newest first">Newest first</MenuItem>
                <MenuItem value="Oldest first">Oldest first</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              startIcon={<IconPlus size={20} />}
              onClick={handleCreate}
            >
              New post
            </Button>
          </Stack>
        </>
      }
    >
      {/* List of posts */}
      <List disablePadding>
        {contents.map((content, idx) => (
          <>
            <ListItem
              key={content.id}
              alignItems="flex-start"
              sx={{
                px: 0,
                py: 2,
                borderBottom:
                  idx === contents.length - 1 ? "none" : "1px solid #f0f0f0",
                "&:hover": { bgcolor: "#fafbfc" },
                transition: "background 0.2s",
              }}
              secondaryAction={
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton
                    onClick={() => handleEdit(content.id)}
                    title="Edit"
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 4,
                      bgcolor: "#fff",
                    }}
                  >
                    <IconPencil size={18} />
                  </IconButton>
                  <IconButton
                    title="Preview"
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 4,
                      bgcolor: "#fff",
                    }}
                    onClick={() => handlePreview(content.id)}
                  >
                    <IconEye size={18} />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(content.id)}
                    title="Delete"
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 4,
                      bgcolor: "#fff",
                      color: "error.main",
                    }}
                  >
                    <IconTrash size={18} />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemAvatar>
                <Avatar
                  src={content.banner}
                  variant="square"
                  sx={{ width: 56, height: 56, borderRadius: 2, mr: 2 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{ color: "#222" }}
                    >
                      {content.title}
                    </Typography>
                    <Chip
                      label={content.status}
                      color={statusColor(content.status)}
                      size="small"
                      sx={{ fontWeight: 500, textTransform: "capitalize" }}
                    />
                  </Stack>
                }
                secondary={
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    mt={0.5}
                  >
                    <Typography variant="body2" color="text.secondary">
                      By {content.createdBy} - {timeAgo(content.createdDate)}
                    </Typography>
                  </Stack>
                }
              />
            </ListItem>
            {idx !== contents.length - 1 && <Divider />}
          </>
        ))}
      </List>
      <EditContentModal
        open={isModalOpen}
        content={editContent}
        isEditMode={isEditMode}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onChange={handleChange}
      />
    </DashboardCard>
  );
};

export default ContentList;
