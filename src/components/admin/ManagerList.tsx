"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Stack,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormControlLabel,
} from "@mui/material";
import { supabase } from "@/lib/supabaseClient";

type Manager = {
  id: string;
  name: string;
  phone: string;
  password: string;
  branch_ids: string[];
  is_admin: boolean;
};

type Branch = {
  id: string;
  title: string;
};

export default function ManagersList() {
  const [rows, setRows] = useState<Manager[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Manager | null>(null);
  const [form, setForm] = useState<{
    name: string;
    phone: string;
    password: string;
    branch_ids: string[];
    is_admin: boolean;
  }>({
    name: "",
    phone: "",
    password: "",
    branch_ids: [],
    is_admin: false,
  });
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchManagers();
    fetchBranches();
  }, []);

  async function fetchManagers() {
    const { data, error } = await supabase
      .from("managers")
      .select("*")
      .order("name");
    if (!error && data) setRows(data as Manager[]);
  }

  async function fetchBranches() {
    const { data, error } = await supabase
      .from("branches")
      .select("id, title")
      .order("title");
    if (!error && data) setBranches(data as Branch[]);
  }

  function handleOpen(manager?: Manager) {
    if (manager) {
      setEditing(manager);
      setForm({
        name: manager.name,
        phone: manager.phone,
        password: manager.password,
        branch_ids: manager.branch_ids || [],
        is_admin: manager.is_admin,
      });
    } else {
      setEditing(null);
      setForm({
        name: "",
        phone: "",
        password: "",
        branch_ids: [],
        is_admin: false,
      });
    }
    setOpen(true);
  }

  async function handleSave() {
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      password: form.password.trim(),
      branch_ids: form.branch_ids,
      is_admin: form.is_admin,
    };

    let resp;
    if (editing) {
      resp = await supabase
        .from("managers")
        .update(payload)
        .eq("id", editing.id);
    } else {
      resp = await supabase.from("managers").insert([payload]);
    }

    if (resp.error) {
      console.error(resp.error);
      setAlert({
        open: true,
        message: "Error saving manager: " + resp.error.message,
        severity: "error",
      });
      return;
    }

    setOpen(false);
    fetchManagers();
    setAlert({
      open: true,
      message: editing ? "Manager updated" : "Manager added",
      severity: "success",
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this manager?")) return;
    const { error } = await supabase.from("managers").delete().eq("id", id);
    if (!error) {
      fetchManagers();
      setAlert({ open: true, message: "Manager deleted", severity: "success" });
    } else {
      setAlert({
        open: true,
        message: "Error deleting manager",
        severity: "error",
      });
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Managers</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Manager
        </Button>
      </Box>

      <Paper sx={{ width: "100%", overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Branches</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.name}</TableCell>
                <TableCell>{m.phone}</TableCell>
                <TableCell>
                  {m.branch_ids
                    ?.map(
                      (bid) => branches.find((b) => b.id === bid)?.title || bid,
                    )
                    .join(", ")}
                </TableCell>
                <TableCell>{m.is_admin ? "✅" : "❌"}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpen(m)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(m.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>No managers yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editing ? "Edit Manager" : "Add Manager"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Branches</InputLabel>
            <Select
              multiple
              value={form.branch_ids}
              onChange={(e) =>
                setForm({ ...form, branch_ids: e.target.value as string[] })
              }
              renderValue={(selected) =>
                (selected as string[])
                  .map((id) => branches.find((b) => b.id === id)?.title || id)
                  .join(", ")
              }
            >
              {branches.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  <Checkbox checked={form.branch_ids.indexOf(b.id) > -1} />
                  <ListItemText primary={b.title} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={form.is_admin}
                onChange={(e) =>
                  setForm({ ...form, is_admin: e.target.checked })
                }
              />
            }
            label="Admin"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Box>
  );
}
