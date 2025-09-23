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

interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  category: string;
}

export default function ServicesTable() {
  const [services, setServices] = useState<Service[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    name: "",
    duration_minutes: "",
    category: "skin",
  });

  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("*");
    setServices(data || []);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async () => {
    const saveData = {
      name: form.name,
      duration_minutes: parseInt(form.duration_minutes),
      category: form.category,
    };

    if (editing) {
      await supabase.from("services").update(saveData).eq("id", form.id);
    } else {
      await supabase.from("services").insert([saveData]);
    }

    setOpen(false);
    fetchServices();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Энэ үйлчилгээг устгах уу?")) {
      await supabase.from("services").delete().eq("id", id);
      fetchServices();
    }
  };

  const openDialog = (service?: Service) => {
    if (service) {
      setEditing(true);
      setForm({
        id: service.id,
        name: service.name,
        duration_minutes: service.duration_minutes.toString(),
        category: service.category,
      });
    } else {
      setEditing(false);
      setForm({
        id: 0,
        name: "",
        duration_minutes: "",
        category: "skin",
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
          Үйлчилгээ нэмэх
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Нэр</TableCell>
            <TableCell>Үргэлжлэх хугацаа (мин)</TableCell>
            <TableCell>Төрөл</TableCell>
            <TableCell>Үйлдэл</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {services.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.duration_minutes}</TableCell>
              <TableCell>{s.category}</TableCell>
              <TableCell>
                <IconButton onClick={() => openDialog(s)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(s.id)}>
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
          {editing ? "Үйлчилгээ засах" : "Шинэ үйлчилгээ"}
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
            type="number"
            label="Үргэлжлэх хугацаа (мин)"
            value={form.duration_minutes}
            onChange={(e) =>
              setForm({ ...form, duration_minutes: e.target.value })
            }
          />
          <TextField
            select
            fullWidth
            margin="dense"
            label="Төрөл"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <MenuItem value="skin">Арьс</MenuItem>
            <MenuItem value="hair">Үс</MenuItem>
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
