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
} from "@mui/material";
import { supabase } from "@/lib/supabaseClient";

type Service = {
  id: string;
  name: string;
  category: string;
  duration: number;
};

export default function ServicesList() {
  const [rows, setRows] = useState<Service[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<{
    name: string;
    category: string;
    duration: string;
  }>({
    name: "",
    category: "",
    duration: "",
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
    fetchServices();
  }, []);

  async function fetchServices() {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("name");
    if (!error && data) setRows(data as Service[]);
  }

  function handleOpen(service?: Service) {
    if (service) {
      setEditing(service);
      setForm({
        name: service.name,
        category: service.category,
        duration: service.duration.toString(),
      });
    } else {
      setEditing(null);
      setForm({ name: "", category: "", duration: "" });
    }
    setOpen(true);
  }

  async function handleSave() {
    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      duration: parseInt(form.duration) || 0,
    };

    let resp;
    if (editing) {
      resp = await supabase
        .from("services")
        .update(payload)
        .eq("id", editing.id);
    } else {
      resp = await supabase.from("services").insert([payload]);
    }

    if (resp.error) {
      console.error(resp.error);
      setAlert({
        open: true,
        message: "Error saving service: " + resp.error.message,
        severity: "error",
      });
      return;
    }

    setOpen(false);
    fetchServices();
    setAlert({
      open: true,
      message: editing ? "Service updated" : "Service added",
      severity: "success",
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (!error) {
      fetchServices();
      setAlert({ open: true, message: "Service deleted", severity: "success" });
    } else {
      setAlert({
        open: true,
        message: "Error deleting service",
        severity: "error",
      });
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Services</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Service
        </Button>
      </Box>

      <Paper sx={{ width: "100%", overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Duration (min)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.category}</TableCell>
                <TableCell>{s.duration}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpen(s)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(s.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>No services yet.</TableCell>
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
        <DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <MenuItem value="skin">Skin</MenuItem>
              <MenuItem value="hair">Hair</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Duration (minutes)"
            type="number"
            fullWidth
            margin="normal"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
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
