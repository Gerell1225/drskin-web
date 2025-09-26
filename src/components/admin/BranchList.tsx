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
  Stack,
  Snackbar,
  Alert,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { supabase } from "@/lib/supabaseClient";

type Branch = {
  id: number;
  title: string;
  description: string | null;
  phone: string[];
  capacity_skin: number | null;
  capacity_hair: number | null;
  map_url: string | null;
};

type FormState = {
  title: string;
  description: string;
  phones: string;
  capacity_skin: string;
  capacity_hair: string;
  map_url: string;
};

export default function BranchList() {
  const [rows, setRows] = useState<Branch[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    phones: "",
    capacity_skin: "",
    capacity_hair: "",
    map_url: "",
  });
  const [error, setError] = useState<string>("");

  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchBranches();
  }, []);

  async function fetchBranches() {
    setLoading(true);
    const { data, error } = await supabase
      .from("branches")
      .select(
        "id, title, description, phone, capacity_skin, capacity_hair, map_url",
      )
      .order("id", { ascending: true });

    if (!error && data) setRows(data as Branch[]);
    setLoading(false);
  }

  function toPhonesArray(input: string): string[] {
    return input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function toPhonesString(arr?: string[]): string {
    return (arr ?? []).join(", ");
  }

  function handleOpen(branch?: Branch) {
    setError("");
    if (branch) {
      setEditing(branch);
      setForm({
        title: branch.title ?? "",
        description: branch.description ?? "",
        phones: toPhonesString(branch.phone),
        capacity_skin: branch.capacity_skin?.toString() ?? "",
        capacity_hair: branch.capacity_hair?.toString() ?? "",
        map_url: branch.map_url ?? "",
      });
    } else {
      setEditing(null);
      setForm({
        title: "",
        description: "",
        phones: "",
        capacity_skin: "",
        capacity_hair: "",
        map_url: "",
      });
    }
    setOpen(true);
  }

  async function handleSave() {
    setError("");
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      phone: toPhonesArray(form.phones),
      capacity_skin: form.capacity_skin ? parseInt(form.capacity_skin) : null,
      capacity_hair: form.capacity_hair ? parseInt(form.capacity_hair) : null,
      map_url: form.map_url.trim() || null,
    };

    if ("id" in payload) delete payload.id;

    let resp;
    if (editing) {
      resp = await supabase
        .from("branches")
        .update(payload)
        .eq("id", editing.id);
    } else {
      resp = await supabase
        .from("branches")
        .insert([payload], { defaultToNull: false });
    }

    if (resp.error) {
      console.error(resp.error);
      setAlert({
        open: true,
        message: "Error saving branch: " + resp.error.message,
        severity: "error",
      });
      return;
    }

    setOpen(false);
    await fetchBranches();

    setAlert({
      open: true,
      message: editing
        ? "Branch updated successfully"
        : "Branch added successfully",
      severity: "success",
    });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this branch?")) return;
    const { error } = await supabase.from("branches").delete().eq("id", id);
    if (!error) {
      fetchBranches();
      setAlert({
        open: true,
        message: "Branch deleted successfully",
        severity: "success",
      });
    } else {
      setAlert({
        open: true,
        message: "Error deleting branch",
        severity: "error",
      });
    }
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Branches</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Branch
        </Button>
      </Box>

      <Paper sx={{ width: "100%", overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Phones</TableCell>
              {!isMobile && <TableCell>Skin Capacity</TableCell>}
              {!isMobile && <TableCell>Hair Capacity</TableCell>}
              {!isMobile && <TableCell>Description</TableCell>}
              <TableCell>Map</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading &&
              rows.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell>{b.title}</TableCell>
                  <TableCell>{toPhonesString(b.phone)}</TableCell>
                  {!isMobile && <TableCell>{b.capacity_skin ?? "-"}</TableCell>}
                  {!isMobile && <TableCell>{b.capacity_hair ?? "-"}</TableCell>}
                  {!isMobile && <TableCell>{b.description ?? "-"}</TableCell>}
                  <TableCell>
                    {b.map_url ? (
                      <Button
                        href={b.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                      >
                        Map
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpen(b)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(b.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            {loading && (
              <TableRow>
                <TableCell colSpan={7}>Loading…</TableCell>
              </TableRow>
            )}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>No branches yet.</TableCell>
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
        <DialogTitle>{editing ? "Edit Branch" : "Add Branch"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Title *"
            fullWidth
            margin="normal"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <TextField
            label="Phones (comma-separated)"
            helperText="Example: 99112233, 88112233"
            fullWidth
            margin="normal"
            value={form.phones}
            onChange={(e) => setForm({ ...form, phones: e.target.value })}
          />
          <TextField
            label="Skin Capacity"
            type="number"
            fullWidth
            margin="normal"
            value={form.capacity_skin}
            onChange={(e) =>
              setForm({ ...form, capacity_skin: e.target.value })
            }
          />
          <TextField
            label="Hair Capacity"
            type="number"
            fullWidth
            margin="normal"
            value={form.capacity_hair}
            onChange={(e) =>
              setForm({ ...form, capacity_hair: e.target.value })
            }
          />
          <TextField
            label="Map URL"
            fullWidth
            margin="normal"
            value={form.map_url}
            onChange={(e) => setForm({ ...form, map_url: e.target.value })}
          />
          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}
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
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
