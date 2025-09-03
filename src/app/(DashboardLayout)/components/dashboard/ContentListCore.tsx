import {
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Button,
  Stack,
  Select,
  FormControl,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  MenuItem,
  TablePagination,
} from "@mui/material";
import { IconPencil, IconTrash, IconEye, IconPlus } from "@tabler/icons-react";
import { ReactNode, useEffect, useState } from "react";
import DashboardCard from "../shared/DashboardCard";
import { useTheme } from "@mui/material/styles";

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

export interface ContentItem {
  id: number;
  title: string;
  textHtml: string;
  banner: string;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
  status: string;
}

interface ContentListCoreProps {
  contents: ContentItem[];
  filters?: ReactNode;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onPreview?: (id: number) => void;
  actionButton?: ReactNode;
  title?: string;
  onCreate?: () => void;
  refetch?: (status?: string) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
}

const ContentListCore = ({
  contents,
  filters,
  onEdit,
  onDelete,
  onPreview,
  actionButton,
  title,
  onCreate,
  refetch,
  filterValue,
  onFilterChange,
}: ContentListCoreProps) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // UI values: 'ALL' | 'Draft' | 'Scheduled' | 'Published'
  const [postFilter, setPostFilter] = useState("ALL");
  const [accessFilter, setAccessFilter] = useState("All access");
  const [authorFilter, setAuthorFilter] = useState("All authors");
  const [tagFilter, setTagFilter] = useState("All tags");
  const [sortFilter, setSortFilter] = useState("Newest first");

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePostFilterChange = (value: string) => {
    try { console.debug('[ContentListCore] filter change ->', value); } catch {}
    // reset to first page when filter changes
    setPage(0);
    if (onFilterChange) onFilterChange(value);
    else setPostFilter(value);
    if (refetch) {
      const override = value === 'ALL' ? '' : value;
      try { console.debug('[ContentListCore] call refetch with ->', override); } catch {}
      refetch(override);
    }
  };

  // If current page is out of range after contents change, clamp to 0
  useEffect(() => {
    const startIndex = page * rowsPerPage;
    if (startIndex >= contents.length && page !== 0) {
      setPage(0);
    }
  }, [contents.length, page, rowsPerPage]);

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedContents = contents.slice(startIndex, endIndex);

  return (
    <DashboardCard
      title={title}
      action={
        <>
          <Stack
            direction="row"
            spacing={1}
            mb={3}
            flexWrap="wrap"
            alignItems="center"
          >
            {title === "Posts" && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={filterValue ?? postFilter}
                  displayEmpty
                  renderValue={(v) => (v && v !== 'ALL' ? String(v) : 'All posts')}
                  onChange={(e) => handlePostFilterChange(String(e.target.value))}
                >
                  <MenuItem value="ALL">All posts</MenuItem>
                  <MenuItem value="Draft">Drafts</MenuItem>
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="Published">Published</MenuItem>
                </Select>
              </FormControl>
            )}
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
              onClick={onCreate}
            >
              New post
            </Button>
          </Stack>
        </>
      }
    >
      <Box>
        {/* Filters and New Post Button */}
        <Stack
          direction="row"
          spacing={1}
          mb={3}
          flexWrap="wrap"
          alignItems="center"
        >
          {filters}
          {actionButton}
        </Stack>
        {/* List of posts */}
        <List disablePadding>
          {paginatedContents.map((content, idx) => (
            <Box key={content.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  px: 0,
                  py: 2,
                  borderBottom:
                    idx === paginatedContents.length - 1
                      ? "none"
                      : `1px solid ${theme.palette.divider}`,
                  "&:hover": {
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.04)"
                        : "#fafbfc",
                  },
                  transition: "background 0.2s",
                }}
                secondaryAction={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton
                      onClick={() => onEdit(content.id)}
                      title="Edit"
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 4,
                        bgcolor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        "&:hover": {
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.08)"
                              : "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      <IconPencil size={18} />
                    </IconButton>
                    {onPreview && (
                      <IconButton
                        title="Preview"
                        sx={{
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 4,
                          bgcolor: theme.palette.background.paper,
                          color: theme.palette.text.primary,
                          "&:hover": {
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.08)"
                                : "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                        onClick={() => onPreview(content.id)}
                      >
                        <IconEye size={18} />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => onDelete(content.id)}
                      title="Delete"
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 4,
                        bgcolor: theme.palette.background.paper,
                        color: theme.palette.error.main,
                        "&:hover": {
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(244, 67, 54, 0.08)"
                              : "rgba(244, 67, 54, 0.04)",
                        },
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
                        sx={{ color: theme.palette.text.primary }}
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
                  secondaryTypographyProps={{ component: "div" }}
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
              {idx !== paginatedContents.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={contents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      </Box>
    </DashboardCard>
  );
};

export default ContentListCore;
