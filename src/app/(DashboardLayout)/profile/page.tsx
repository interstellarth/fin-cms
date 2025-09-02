"use client";

import {
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { useEffect, useState } from "react";

type ErrorData = { error?: string };

export default function EditProfilePage() {
  const [userId, setUserId] = useState<string | number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // extra fields kept for layout compatibility (not saved to users table)
  const [labels, setLabels] = useState("");
  const [note, setNote] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [role, setRole] = useState("Member");
  const [openModal, setOpenModal] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const toUiRole = (db: any): string => {
      const v = typeof db === "string" ? db.toUpperCase() : "";
      if (v === "ADMIN") return "Admin";
      if (v === "EDITOR") return "Editor";
      if (v === "VIEWER" || v === "MEMBER") return "Member";
      return "Member";
    };
    const toDbRole = (ui: string): string => {
      const v = ui.toLowerCase();
      if (v === "admin") return "ADMIN";
      if (v === "editor") return "EDITOR";
      return "MEMBER"; // map Member -> MEMBER
    };

    // expose mapper for save
    (window as any).__roleMapper = { toUiRole, toDbRole };

    const loadUser = async () => {
      const raw = localStorage.getItem("user");
      const basic = raw ? JSON.parse(raw) : null;
      if (basic) {
        setUserId(basic.id ?? null);
        setName(basic.username || "");
        setEmail(typeof basic.email === "string" ? basic.email : "");
        setRole(toUiRole(basic.role));
      }

      // Prefer id; if missing, try username or email
      let data: any = null;
      if (basic?.id) {
        const r = await fetch(`/api/users/${basic.id}`);
        if (r.ok) ({ data } = await r.json());
      }
      if (!data && basic?.username) {
        const r = await fetch(`/api/users?username=${encodeURIComponent(basic.username)}`);
        if (r.ok) ({ data } = await r.json());
      }
      if (!data && basic?.email) {
        const r = await fetch(`/api/users?email=${encodeURIComponent(basic.email)}`);
        if (r.ok) ({ data } = await r.json());
      }
      if (!data) return;

      setUserId(data.id);
      setName(data.username || "");
      setEmail(typeof data.email === "string" ? data.email : "");
      setRole(toUiRole(data.role));

      try {
        localStorage.setItem(
          "user",
          JSON.stringify({ id: data.id, username: data.username, email: data.email, role: data.role })
        );
      } catch {}
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    setMessage("");
    try {
      // Get current user data
      const userData = localStorage.getItem("user");
      if (!userData) {
        setMessage("User not authenticated");
        return;
      }

      const currentUser = JSON.parse(userData);

      if (!userId) {
        setMessage("User id missing; please login again.");
        return;
      }

      const idForPath = isNaN(Number(userId)) ? String(userId) : String(Number(userId));

      const res = await fetch(`/api/users/${idForPath}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          email,
          password: password || undefined, // optional
          role: ((window as any)?.__roleMapper?.toDbRole?.(role)) || "MEMBER",
        }),
      });

      const result = await res.text();
      if (res.ok) {
        const responseData = JSON.parse(result);
        // Re-fetch latest row to be 100% consistent
        try {
          const rereq = await fetch(`/api/users/${idForPath}`);
          if (rereq.ok) {
            const { data } = await rereq.json();
            if (data) {
              localStorage.setItem("user", JSON.stringify(data));
              setUserId(data.id);
              setName(data.username || "");
              setEmail(typeof data.email === "string" ? data.email : "");
              const toUi = (window as any)?.__roleMapper?.toUiRole;
              setRole(toUi ? toUi(data.role) : role);
            }
          }
        } catch {}

        setOpenModal(true);
        setMessage("Profile updated successfully!");
      } else {
        let data: ErrorData = {};
        try {
          data = JSON.parse(result);
        } catch {
          data = { error: result || "Unknown error" };
        }
        setMessage(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch (error: any) {
      setMessage(`Failed: ${error.message || "Unknown error"}`);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>✅ Profile Updated</DialogTitle>
        <DialogContent>
          <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
      </Box>

      <Box display="flex" gap={4} alignItems="flex-start" mb={4}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar sx={{ width: 80, height: 80, fontSize: 32 }}>
            {(name || email)?.toString()?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
          <Typography mt={1} fontWeight="medium">
            Edit Profile
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ flexGrow: 1, p: 3, borderRadius: 2 }}>
          <Stack spacing={3}>
            <Box display="flex" gap={2}>
              <TextField
                label="Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Box>

            <TextField
              label="New Password (optional)"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Leave blank to keep current password"
            />

            <TextField
              select
              label="Role"
              fullWidth
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="Member">Member</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Editor">Editor</MenuItem>
            </TextField>

            <TextField
              label="Labels (comma separated)"
              fullWidth
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="e.g. vip,subscriber"
            />

            <TextField
              label="Note"
              fullWidth
              multiline
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              helperText="Maximum: 500 characters. Not visible to member"
            />
          </Stack>
        </Paper>
      </Box>

      <Box sx={{ maxWidth: 800, ml: "auto", mr: "auto" }}>
        <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography fontWeight="bold" mb={2}>
            NEWSLETTERS
          </Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography fontWeight="medium">Receive newsletter?</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                />
              }
              label=""
            />
          </Box>
          <Typography variant="body2" color="text.secondary" mt={1}>
            If disabled, you will <strong>not</strong> receive newsletter
            emails.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
