import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Switch,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import { IconListCheck, IconMail, IconUser } from "@tabler/icons-react";
import { useTheme } from "@/utils/ThemeContext";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState<{
    username?: string;
    email?: string;
  } | null>(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const { mode, toggleTheme } = useTheme();
  const router = useRouter();

  const goToEditProfile = () => {
    router.push("/profile");
    handleClose2();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const applyFromStorage = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try { setUser(JSON.parse(userData)); } catch { setUser(null); }
        return true;
      }
      return false;
    };

    const ok = applyFromStorage();
    if (!ok) {
      // Fallback: try fetch by last known username from sessionStorage
      const lastUsername = sessionStorage.getItem("lastUsername");
      if (lastUsername) {
        fetch(`/api/users?username=${encodeURIComponent(lastUsername)}`)
          .then((r) => r.json())
          .then((j) => {
            if (j?.data) {
              setUser(j.data);
              try { localStorage.setItem("user", JSON.stringify(j.data)); } catch {}
            }
          })
          .catch(() => {});
      }
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "user") applyFromStorage();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleThemeToggle = () => {
    toggleTheme();
    handleClose2();
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          justifyContent: "space-between",
          width: "100%",
          cursor: "pointer",
        }}
        onClick={handleClick2}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user?.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <IconButton size="small">
          <SettingsIcon />
        </IconButton>
        {/* ------------------------------------------- */}
        {/* Message Dropdown */}
        {/* ------------------------------------------- */}
      </Box>
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "200px",
          },
        }}
      >
        <MenuItem onClick={goToEditProfile}>
          <ListItemIcon>
            <IconUser width={20} />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleThemeToggle}>
          <ListItemIcon>
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText>
            {mode === "dark" ? "Light Mode" : "Dark Mode"}
          </ListItemText>
          <Switch
            checked={mode === "dark"}
            onChange={handleThemeToggle}
            size="small"
            onClick={(e) => e.stopPropagation()}
          />
        </MenuItem>

        <Box mt={1} py={1} px={2}>
          <Button
            href="/authentication/login"
            variant="outlined"
            color="primary"
            component={Link}
            fullWidth
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </>
  );
}
