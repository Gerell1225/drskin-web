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
import dayjs from "dayjs";

interface Booking {
  id: number;
  name: string;
  phone: string;
  booking_time: string;
  status: string;
  branch_id: number | null;
  service_id: number | null;
  branch?: { title: string };
  service?: { name: string };
}

interface Service {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  title: string;
}

export default function BookingsTable() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    name: "",
    phone: "",
    booking_time: "",
    status: "pending",
    service_id: "",
    branch_id: "",
  });
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const r = localStorage.getItem("role");
    setRole(r);
  }, []);

  const fetchBookings = async () => {
    let query = supabase
      .from("bookings")
      .select(
        `id, name, phone, booking_time, status, branch_id, service_id,
         branch:branches(title),
         service:services(name)`,
      )
      .order("booking_time", { ascending: true });

    if (role === "manager") {
      const branch_id = localStorage.getItem("branch_id");
      if (branch_id) query = query.eq("branch_id", branch_id);
    }

    const { data, error } = await query;

    if (!error && data) {
      const normalized = (data as unknown as Booking[]).map((b) => ({
        ...b,
        branch: Array.isArray(b.branch) ? b.branch[0] : b.branch,
        service: Array.isArray(b.service) ? b.service[0] : b.service,
      }));
      setBookings(normalized);
    }
  };

  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("id, name");
    setServices(data || []);
  };

  const fetchBranches = async () => {
    const { data } = await supabase.from("branches").select("id, title");
    setBranches(data || []);
  };

  useEffect(() => {
    if (role) {
      fetchBookings();
      fetchServices();
      fetchBranches();
    }
  }, [role]);

  const handleSave = async () => {
    const saveData = {
      name: form.name,
      phone: form.phone,
      booking_time: form.booking_time,
      status: form.status,
      service_id: form.service_id ? parseInt(form.service_id) : null,
      branch_id: form.branch_id ? parseInt(form.branch_id) : null,
    };

    if (editing) {
      await supabase.from("bookings").update(saveData).eq("id", form.id);
    } else {
      await supabase.from("bookings").insert([saveData]);
    }

    setOpen(false);
    fetchBookings();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Энэ захиалгыг устгах уу?")) {
      await supabase.from("bookings").delete().eq("id", id);
      fetchBookings();
    }
  };

  const openDialog = (booking?: Booking) => {
    if (booking) {
      setEditing(true);
      setForm({
        id: booking.id,
        name: booking.name,
        phone: booking.phone,
        booking_time: dayjs(booking.booking_time).format("YYYY-MM-DDTHH:mm"),
        status: booking.status,
        service_id: booking.service_id?.toString() || "",
        branch_id: booking.branch_id?.toString() || "",
      });
    } else {
      setEditing(false);
      setForm({
        id: 0,
        name: "",
        phone: "",
        booking_time: "",
        status: "pending",
        service_id: "",
        branch_id: "",
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
          Захиалга нэмэх
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Нэр</TableCell>
            <TableCell>Утас</TableCell>
            <TableCell>Үйлчилгээ</TableCell>
            <TableCell>Салбар</TableCell>
            <TableCell>Цаг</TableCell>
            <TableCell>Төлөв</TableCell>
            <TableCell>Үйлдэл</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((b) => (
            <TableRow key={b.id}>
              <TableCell>{b.name}</TableCell>
              <TableCell>{b.phone}</TableCell>
              <TableCell>{b.service?.name || "-"}</TableCell>
              <TableCell>{b.branch?.title || "-"}</TableCell>
              <TableCell>
                {dayjs(b.booking_time).format("YYYY-MM-DD HH:mm")}
              </TableCell>
              <TableCell>{b.status}</TableCell>
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
        <DialogTitle>
          {editing ? "Захиалга засах" : "Шинэ захиалга"}
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
            type="datetime-local"
            label="Цаг"
            InputLabelProps={{ shrink: true }}
            value={form.booking_time}
            onChange={(e) => setForm({ ...form, booking_time: e.target.value })}
          />
          <TextField
            select
            fullWidth
            margin="dense"
            label="Үйлчилгээ"
            value={form.service_id}
            onChange={(e) => setForm({ ...form, service_id: e.target.value })}
          >
            {services.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
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
            fullWidth
            margin="dense"
            label="Төлөв"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
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
