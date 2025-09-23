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
  Paper,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface Branch {
  id: number;
  title: string;
  description: string;
  phone: string[];
}

export default function BranchesTable() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    title: "",
    description: "",
    phone: "",
  });
  const [editing, setEditing] = useState(false);

  const fetchBranches = async () => {
    const { data } = await supabase.from("branches").select("*");
    setBranches(data || []);
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSave = async () => {
    if (editing) {
      await supabase
        .from("branches")
        .update({
          title: form.title,
          description: form.description,
          phone: form.phone.split(","),
        })
        .eq("id", form.id);
    } else {
      await supabase.from("branches").insert([
        {
          title: form.title,
          description: form.description,
          phone: form.phone.split(","),
        },
      ]);
    }
    setOpen(false);
    fetchBranches();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Устгах уу?")) {
      await supabase.from("branches").delete().eq("id", id);
      fetchBranches();
    }
  };

  const openDialog = (branch?: Branch) => {
    if (branch) {
      setEditing(true);
      setForm({
        id: branch.id,
        title: branch.title,
        description: branch.description,
        phone: branch.phone.join(","),
      });
    } else {
      setEditing(false);
      setForm({ id: 0, title: "", description: "", phone: "" });
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
          Салбар нэмэх
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Нэр</TableCell>
            <TableCell>Тайлбар</TableCell>
            <TableCell>Утас</TableCell>
            <TableCell>Үйлдэл</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {branches.map((b) => (
            <TableRow key={b.id}>
              <TableCell>{b.title}</TableCell>
              <TableCell>{b.description}</TableCell>
              <TableCell>{b.phone.join(", ")}</TableCell>
              <TableCell>
                <IconButton onClick={() => openDialog(b)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(b.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editing ? "Салбар засах" : "Шинэ салбар"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Нэр"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Тайлбар"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Утас (`,`-р салга)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
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
