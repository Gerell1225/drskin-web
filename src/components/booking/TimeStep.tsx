"use client";

import { useEffect, useState } from "react";
import { Grid, Button, CircularProgress } from "@mui/material";
import { supabase } from "@/lib/supabaseClient";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";

interface Service {
  id: number;
  name: string;
  category: "skin" | "hair";
  duration: number;
}

interface Branch {
  id: number;
  title: string;
  capacity_skin: number;
  capacity_hair: number;
}

interface Booking {
  id: number;
  start_time: string;
  services: {
    duration: number;
    category: "skin" | "hair";
  };
}

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

export default function TimeStep({
  service,
  branch,
  date,
  time,
  setTime,
}: {
  service: Service;
  branch: Branch;
  date: Dayjs | null;
  time: string | null;
  setTime: (t: string) => void;
}) {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSlots() {
      if (!service || !branch || !date) return;

      setLoading(true);
      const dayStr = date.format("YYYY-MM-DD");

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          start_time,
          services!inner (
            duration,
            category
          )
        `,
        )
        .eq("branch_id", branch.id)
        .eq("date", dayStr);

      if (error) {
        console.error("Supabase error:", error);
        setLoading(false);
        return;
      }

      const typedBookings: Booking[] = (data || []).map((b) => ({
        ...b,
        services: Array.isArray(b.services) ? b.services[0] : b.services,
      }));

      let current: string;
      if (date.isSame(dayjs(), "day")) {
        current = roundToNext30(new Date());
      } else {
        current = "11:00";
      }

      const possible: string[] = [];
      while (addMinutes(current, service.duration) <= "19:30") {
        possible.push(current);
        current = addMinutes(current, 30);
      }

      const available = possible.filter((slot) => {
        const concurrent = typedBookings.filter(
          (b) =>
            overlaps(
              slot,
              service.duration,
              b.start_time,
              b.services.duration,
            ) && b.services.category === service.category,
        ).length;

        const branchCap =
          service.category === "skin"
            ? branch.capacity_skin
            : branch.capacity_hair;

        return concurrent < branchCap;
      });

      setSlots(available);
      setLoading(false);
    }

    loadSlots();
  }, [service, branch, date]);

  if (loading) return <CircularProgress />;

  return (
    <Grid container spacing={1}>
      {slots.length > 0 ? (
        slots.map((slot) => (
          <Grid item xs={4} sm={3} key={slot}>
            <Button
              variant={time === slot ? "contained" : "outlined"}
              onClick={() => setTime(slot)}
              fullWidth
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                bgcolor: time === slot ? "#333" : "white",
                color: time === slot ? "white" : "black",
                borderColor: "#333",
                "&:hover": {
                  bgcolor: time === slot ? "#444" : "#f5f5f5",
                },
              }}
            >
              {slot}
            </Button>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <p style={{ textAlign: "center", color: "gray" }}>
            Энэ өдөр боломжит цаг алга байна
          </p>
        </Grid>
      )}
    </Grid>
  );
}
