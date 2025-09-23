"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface Manager {
  id: number;
  name: string;
  phone: string;
  password: string;
  branch_id: number | null;
  is_admin: boolean;
  branch?: { title: string };
}

interface Branch {
  id: number;
  title: string;
}

export default function ManagersTable() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    name: "",
    phone: "",
    password: "",
    branch_id: "",
    is_admin: "false",
  });

  const fetchManagers = async () => {
    const { data, error } = await supabase
      .from("managers")
      .select(
        "id, name, phone, password, branch_id, is_admin, branch:branches(title)",
      );

    if (!error && data) {
      const normalized = (data as unknown as Manager[]).map((m) => ({
        ...m,
        branch: Array.isArray(m.branch) ? m.branch[0] : m.branch,
      }));
      setManagers(normalized);
    }
  };

  const fetchBranches = async () => {
    const { data } = await supabase.from("branches").select("id, title");
    setBranches(data || []);
  };

  useEffect(() => {
    fetchManagers();
    fetchBranches();
  }, []);

  const handleSave = async () => {
    const saveData = {
      name: form.name,
      phone: form.phone,
      password: form.password,
      branch_id: form.branch_id ? parseInt(form.branch_id) : null,
      is_admin: form.is_admin === "true",
    };

    if (editing) {
      await supabase.from("managers").update(saveData).eq("id", form.id);
    } else {
      await supabase.from("managers").insert([saveData]);
    }

    setOpen(false);
    fetchManagers();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Энэ менежерийг устгах уу?")) {
      await supabase.from("managers").delete().eq("id", id);
      fetchManagers();
    }
  };

  const openDialog = (manager?: Manager) => {
    if (manager) {
      setEditing(true);
      setForm({
        id: manager.id,
        name: manager.name,
        phone: manager.phone,
        password: manager.password,
        branch_id: manager.branch_id?.toString() || "",
        is_admin: manager.is_admin ? "true" : "false",
      });
    } else {
      setEditing(false);
      setForm({
        id: 0,
        name: "",
        phone: "",
        password: "",
        branch_id: "",
        is_admin: "false",
      });
    }
    setOpen(true);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => openDialog()}
        >
          Менежер нэмэх
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Нэр</TableCell>
            <TableCell>Утас</TableCell>
            <TableCell>Нууц үг</TableCell>
            <TableCell>Салбар</TableCell>
            <TableCell>Админ эсэх</TableCell>
            <TableCell>Үйлдэл</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {managers.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.name}</TableCell>
              <TableCell>{m.phone}</TableCell>
              <TableCell>{m.password}</TableCell>
              <TableCell>{m.branch?.title || "-"}</TableCell>
              <TableCell>{m.is_admin ? "Тийм" : "Үгүй"}</TableCell>
              <TableCell>
                <IconButton onClick={() => openDialog(m)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(m.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editing ? "Менежер засах" : "Шинэ менежер нэмэх"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Нэр"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Утас"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Нууц үг"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <TextField
            select
            fullWidth
            margin="dense"
            label="Салбар"
            value={form.branch_id}
            onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
          >
            {branches.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            margin="dense"
            label="Админ эсэх"
            value={form.is_admin}
            onChange={(e) => setForm({ ...form, is_admin: e.target.value })}
          >
            <MenuItem value="true">Тийм</MenuItem>
            <MenuItem value="false">Үгүй</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Цуцлах</Button>
          <Button onClick={handleSave} variant="contained">
            Хадгалах
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
