"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { supabase } from "@/lib/supabaseClient";

type Branch = {
  id: string;
  title: string;
  capacity_skin: number | null;
  capacity_hair: number | null;
};

type Service = {
  id: string;
  name: string;
  category: "skin" | "hair";
  duration: number;
};

type Booking = {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_id: string;
  branch_id: string;
  date: string;
  start_time: string;
  service: Service;
};

type Manager = {
  id: string;
  name: string;
  is_admin: boolean;
  branch_ids: string[];
};

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const date = new Date(0, 0, 0, h, m);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toTimeString().slice(0, 5);
}

function overlaps(t1: string, d1: number, t2: string, d2: number): boolean {
  const start1 = new Date(
    0,
    0,
    0,
    +t1.split(":")[0],
    +t1.split(":")[1],
  ).getTime();
  const end1 = start1 + d1 * 60000;
  const start2 = new Date(
    0,
    0,
    0,
    +t2.split(":")[0],
    +t2.split(":")[1],
  ).getTime();
  const end2 = start2 + d2 * 60000;
  return start1 < end2 && start2 < end1;
}

function roundToNext30(date: Date): string {
  const mins = date.getMinutes();
  const add = mins > 0 && mins <= 30 ? 30 - mins : (60 - mins) % 60;
  date.setMinutes(mins + add, 0, 0);
  return date.toTimeString().slice(0, 5);
}

export default function BookingSheet() {
  const [user, setUser] = useState<Manager | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [beds, setBeds] = useState<{ skin: number; hair: number }>({
    skin: 0,
    hair: 0,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialog, setDetailDialog] = useState<Booking | null>(null);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [form, setForm] = useState<{
    customer_name: string;
    customer_phone: string;
    service_id: string;
    start_time: string;
  }>({
    customer_name: "",
    customer_phone: "",
    service_id: "",
    start_time: "",
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchUser();
  }, []);
  useEffect(() => {
    if (user) fetchBranches();
  }, [user]);
  useEffect(() => {
    if (selectedBranch) {
      fetchBookings();
      fetchCapacity();
      fetchServices();
    }
  }, [selectedBranch, date]);

  async function fetchUser() {
    const saved = localStorage.getItem("manager");
    if (saved) setUser(JSON.parse(saved));
  }

  async function fetchBranches() {
    if (!user) return;
    let query = supabase.from("branches").select("*").order("title");
    if (!user.is_admin) {
      query = query.in("id", user.branch_ids);
    }
    const { data } = await query;
    if (data) {
      setBranches(data);
      if (!selectedBranch && data.length > 0) setSelectedBranch(data[0].id);
    }
  }

  async function fetchServices() {
    const { data } = await supabase.from("services").select("*");
    if (data) setServices(data as Service[]);
  }

  async function fetchBookings() {
    const { data } = await supabase
      .from("bookings")
      .select(
        `
        id, customer_name, customer_phone, service_id, branch_id, date, start_time,
        service:services(id, name, category, duration)
      `,
      )
      .eq("branch_id", selectedBranch)
      .eq("date", date.format("YYYY-MM-DD"));
    if (data) setBookings(data as unknown as Booking[]);
  }

  async function fetchCapacity() {
    const branch = branches.find((b) => b.id === selectedBranch);
    if (branch) {
      setBeds({
        skin: branch.capacity_skin || 0,
        hair: branch.capacity_hair || 0,
      });
    }
  }

  useEffect(() => {
    async function loadSlots() {
      if (!form.service_id || !selectedBranch || !date) return;
      const service = services.find((s) => s.id === form.service_id);
      if (!service) return;

      const dayStr = date.format("YYYY-MM-DD");
      const { data } = await supabase
        .from("bookings")
        .select(
          `
          id,
          start_time,
          service:services(id, duration, category)
        `,
        )
        .eq("branch_id", selectedBranch)
        .eq("date", dayStr)
        .returns<Booking[]>();

      const typedBookings: Booking[] = (data || []).map((b) => ({
        ...b,
        service: Array.isArray(b.service) ? b.service[0] : b.service,
      }));

      let current: string;
      if (date.isSame(dayjs(), "day")) {
        current = roundToNext30(new Date());
      } else {
        current = "11:00";
      }

      const possible: string[] = [];
      while (addMinutes(current, service.duration) <= "20:00") {
        possible.push(current);
        current = addMinutes(current, 30);
      }

      const branchCap = service.category === "skin" ? beds.skin : beds.hair;

      const available = possible.filter((slot) => {
        const concurrent = typedBookings.filter(
          (b) =>
            overlaps(
              slot,
              service.duration,
              b.start_time,
              b.service.duration,
            ) && b.service.category === service.category,
        ).length;
        return concurrent < branchCap;
      });

      setAvailableSlots(available);
    }
    loadSlots();
  }, [form.service_id, selectedBranch, date, beds]);

  async function handleSave() {
    const payload = {
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      service_id: form.service_id,
      start_time: form.start_time,
      branch_id: selectedBranch,
      date: date.format("YYYY-MM-DD"),
    };

    let resp;
    if (editing) {
      resp = await supabase
        .from("bookings")
        .update(payload)
        .eq("id", editing.id);
    } else {
      resp = await supabase.from("bookings").insert([payload]);
    }

    if (resp.error) {
      setAlert({
        open: true,
        message: "Error: " + resp.error.message,
        severity: "error",
      });
      return;
    }

    setDialogOpen(false);
    setEditing(null);
    fetchBookings();
    setAlert({
      open: true,
      message: editing ? "Booking updated" : "Booking added",
      severity: "success",
    });
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (!error) {
      setDetailDialog(null);
      fetchBookings();
      setAlert({ open: true, message: "Booking deleted", severity: "success" });
    } else {
      setAlert({
        open: true,
        message: "Error deleting booking",
        severity: "error",
      });
    }
  }

  return (
    <Box>
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Branch</InputLabel>
          <Select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            {branches.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <DatePicker value={date} onChange={(d) => d && setDate(d)} />
        <Button
          variant="contained"
          onClick={() => {
            setEditing(null);
            setForm({
              customer_name: "",
              customer_phone: "",
              service_id: "",
              start_time: "",
            });
            setDialogOpen(true);
          }}
        >
          Add Booking
        </Button>
      </Box>

      <Typography variant="h6" mt={2}>
        Skin
      </Typography>
      <BookingGrid
        bookings={bookings.filter((b) => b.service.category === "skin")}
        beds={beds.skin}
        timeSlots={Array.from({ length: 22 }, (_, i) =>
          dayjs()
            .hour(10)
            .minute(0)
            .add(i * 30, "minute"),
        )}
        onClickBooking={(b) => setDetailDialog(b)}
      />

      <Typography variant="h6" mt={4}>
        Hair
      </Typography>
      <BookingGrid
        bookings={bookings.filter((b) => b.service.category === "hair")}
        beds={beds.hair}
        timeSlots={Array.from({ length: 22 }, (_, i) =>
          dayjs()
            .hour(10)
            .minute(0)
            .add(i * 30, "minute"),
        )}
        onClickBooking={(b) => setDetailDialog(b)}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editing ? "Edit Booking" : "Add Booking"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Customer Name"
            fullWidth
            margin="normal"
            value={form.customer_name}
            onChange={(e) =>
              setForm({ ...form, customer_name: e.target.value })
            }
          />
          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            value={form.customer_phone}
            onChange={(e) =>
              setForm({ ...form, customer_phone: e.target.value })
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Service</InputLabel>
            <Select
              value={form.service_id}
              onChange={(e) => setForm({ ...form, service_id: e.target.value })}
            >
              {services.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} ({s.category}, {s.duration}min)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" disabled={!form.service_id}>
            <InputLabel>Start Time</InputLabel>
            <Select
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            >
              {availableSlots.map((slot) => (
                <MenuItem key={slot} value={slot}>
                  {slot}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!detailDialog}
        onClose={() => setDetailDialog(null)}
        fullWidth
        maxWidth="sm"
      >
        {detailDialog && (
          <>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogContent>
              <Typography>Name: {detailDialog.customer_name}</Typography>
              <Typography>Phone: {detailDialog.customer_phone}</Typography>
              <Typography>Service: {detailDialog.service.name}</Typography>
              <Typography>
                Branch:{" "}
                {branches.find((b) => b.id === detailDialog.branch_id)?.title}
              </Typography>
              <Typography>
                Time: {detailDialog.start_time} –{" "}
                {dayjs(detailDialog.start_time, ["HH:mm", "HH:mm:ss"])
                  .add(detailDialog.service.duration, "minute")
                  .format("HH:mm")}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                color="error"
                onClick={() => handleDelete(detailDialog.id)}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setEditing(detailDialog);
                  setForm({
                    customer_name: detailDialog.customer_name,
                    customer_phone: detailDialog.customer_phone,
                    service_id: detailDialog.service_id,
                    start_time: detailDialog.start_time,
                  });
                  setDetailDialog(null);
                  setDialogOpen(true);
                }}
              >
                Edit
              </Button>
            </DialogActions>
          </>
        )}
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

function BookingGrid({
  bookings,
  beds,
  timeSlots,
  onClickBooking,
}: {
  bookings: Booking[];
  beds: number;
  timeSlots: Dayjs[];
  onClickBooking: (b: Booking) => void;
}) {
  const grid: Record<number, Record<string, Booking | null>> = {};
  for (let bed = 1; bed <= beds; bed++) {
    grid[bed] = {};
    timeSlots.forEach((t) => (grid[bed][t.format("HH:mm")] = null));
  }

  const sorted = [...bookings].sort(
    (a, b) =>
      dayjs(a.start_time, ["HH:mm", "HH:mm:ss"]).unix() -
      dayjs(b.start_time, ["HH:mm", "HH:mm:ss"]).unix(),
  );

  sorted.forEach((b) => {
    const start = dayjs(b.start_time, ["HH:mm", "HH:mm:ss"]);
    const end = start.add(b.service.duration, "minute");
    for (let bed = 1; bed <= beds; bed++) {
      const conflict = timeSlots.some(
        (t) =>
          (t.isSame(start) || t.isAfter(start)) &&
          t.isBefore(end) &&
          grid[bed][t.format("HH:mm")] !== null,
      );
      if (!conflict) {
        timeSlots.forEach((t) => {
          if ((t.isSame(start) || t.isAfter(start)) && t.isBefore(end)) {
            grid[bed][t.format("HH:mm")] = b;
          }
        });
        break;
      }
    }
  });

  return (
    <Paper sx={{ overflowX: "auto", mb: 3 }}>
      <table
        style={{ borderCollapse: "collapse", width: "100%", minWidth: "800px" }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "6px",
                background: "#f5f5f5",
              }}
            >
              Bed
            </th>
            {timeSlots.map((t) => (
              <th
                key={t.format("HH:mm")}
                style={{
                  border: "1px solid #ddd",
                  padding: "4px",
                  textAlign: "center",
                }}
              >
                {t.format("HH:mm")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: beds }, (_, i) => i + 1).map((bed) => (
            <tr key={bed}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "6px",
                  fontWeight: 500,
                }}
              >
                Bed {bed}
              </td>
              {timeSlots.map((t) => {
                const booking = grid[bed][t.format("HH:mm")];
                if (
                  booking &&
                  t.format("HH:mm") ===
                    dayjs(booking.start_time, ["HH:mm", "HH:mm:ss"]).format(
                      "HH:mm",
                    )
                ) {
                  return (
                    <td
                      key={t.format("HH:mm")}
                      colSpan={booking.service.duration / 30}
                      style={{
                        border: "1px solid #ddd",
                        background: "#d1e7dd",
                        cursor: "pointer",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => onClickBooking(booking)}
                    >
                      {booking.customer_name} ({booking.customer_phone})<br />
                      {booking.service.name}
                    </td>
                  );
                }
                if (booking) return null;
                return (
                  <td
                    key={t.format("HH:mm")}
                    style={{ border: "1px solid #eee" }}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Paper>
  );
}
