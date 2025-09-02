import React from "react";
import Menuitems from "./MenuItems";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
} from "@mui/material";
import {
  IconPoint,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import Logo from "../shared/logo/Logo";

const renderMenuItems = (
  items: any,
  pathDirect: any,
  openSubmenus: any,
  handleSubmenuToggle: any,
  theme: any
) => {
  return items.map((item: any) => {
    const Icon = item.icon ? item.icon : IconPoint;
    // Avoid React warning: width/height should be numbers, not rem
    const itemIcon = <Icon stroke={1.5} size={21} />;

    if (item.subheader) {
      // Display Subheader
      return (
        <Box key={item.subheader} sx={{ mt: 2, mb: 1 }}>
          <Typography
            variant="caption"
            sx={{
              px: 3,
              py: 1,
              color: theme.palette.mode === "dark" ? "#9ca3af" : "#5A6A85",
              fontWeight: 600,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {item.subheader}
          </Typography>
        </Box>
      );
    }

    // If the item has children (submenu)
    if (item.children) {
      const isOpen = openSubmenus[item.id] || false;
      return (
        <Box key={item.id}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleSubmenuToggle(item.id)}
              sx={{
                mx: 1,
                borderRadius: "8px",
                mb: 0.5,
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(93, 135, 255, 0.08)",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                {itemIcon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                sx={{
                  "& .MuiListItemText-primary": {
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                  },
                }}
              />
              {isOpen ? (
                <IconChevronDown size={16} />
              ) : (
                <IconChevronRight size={16} />
              )}
            </ListItemButton>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderMenuItems(
                  item.children,
                  pathDirect,
                  openSubmenus,
                  handleSubmenuToggle,
                  theme
                )}
              </List>
            </Collapse>
          </ListItem>
        </Box>
      );
    }

    // If the item has no children, render a MenuItem
    const isSelected = pathDirect === item?.href;

    return (
      <ListItem key={item.id} disablePadding>
        <ListItemButton
          component={Link}
          href={item.href}
          selected={isSelected}
          sx={{
            mx: 1,
            borderRadius: "8px",
            mb: 0.5,
            backgroundColor: isSelected
              ? theme.palette.mode === "dark"
                ? "rgba(93, 135, 255, 0.2)"
                : "rgba(93, 135, 255, 0.1)"
              : "transparent",
            color: isSelected
              ? theme.palette.primary.main
              : theme.palette.text.primary,
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(93, 135, 255, 0.08)",
            },
            "&.Mui-selected": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(93, 135, 255, 0.2)"
                  : "rgba(93, 135, 255, 0.1)",
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(93, 135, 255, 0.25)"
                    : "rgba(93, 135, 255, 0.15)",
              },
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: isSelected ? theme.palette.primary.main : "inherit",
            }}
          >
            {itemIcon}
          </ListItemIcon>
          <ListItemText
            primary={item.title}
            sx={{
              "& .MuiListItemText-primary": {
                fontWeight: isSelected ? 600 : 500,
              },
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  });
};

const SidebarItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const theme = useTheme();
  const [openSubmenus, setOpenSubmenus] = React.useState<{
    [key: string]: boolean;
  }>({});

  const handleSubmenuToggle = (id: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Logo />
      </Box>

      {/* Menu Items */}
      <Box sx={{ flex: 1, overflow: "auto", py: 2 }}>
        <List component="nav" sx={{ px: 1 }}>
          {renderMenuItems(
            Menuitems,
            pathDirect,
            openSubmenus,
            handleSubmenuToggle,
            theme
          )}
        </List>
      </Box>
    </Box>
  );
};

export default SidebarItems;
