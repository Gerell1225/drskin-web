"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { supabase } from "@/lib/supabaseClient";

const steps = ["Үйлчилгээ", "Салбар", "Огноо", "Цаг"];

interface Service {
  id: number;
  name: string;
  duration_minutes?: number;
}

interface Branch {
  id: number;
  title: string;
  description: string;
  phone?: string | null;
}

const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let h = 10; h < 21; h++) {
    slots.push(`${h}:00`);
    slots.push(`${h}:30`);
  }
  slots.push("21:00");
  return slots;
};

export default function BookingForm() {
  const [activeStep, setActiveStep] = useState(0);

  const [service, setService] = useState<Service | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: serviceData } = await supabase.from("services").select("*");
      const { data: branchData } = await supabase.from("branches").select("*");

      setServices(serviceData || []);
      setBranches(branchData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      const bookingDate = date?.format("YYYY-MM-DD");
      if (!bookingDate || !time || !service || !branch) return;

      const { error } = await supabase.from("bookings").insert([
        {
          service_id: service.id,
          branch_id: branch.id,
          booking_time: `${bookingDate}T${time}:00+08:00`,
          status: "pending",
          payment_status: "unpaid",
        },
      ]);

      if (error) {
        console.error("Booking insert error:", error.message);
        alert("Алдаа гарлаа, дахин оролдоно уу!");
        return;
      }

      alert("Таны цагийг бүртгэлээ!");
      setActiveStep(0);
      setService(null);
      setBranch(null);
      setDate(null);
      setTime(null);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mt: 4 }}>
        {activeStep === 0 && (
          <Grid container spacing={2}>
            {services.map((s) => (
              <Grid item xs={12} sm={6} key={s.id}>
                <Card
                  sx={{
                    bgcolor: service?.id === s.id ? "#333" : "white",
                    color: service?.id === s.id ? "white" : "black",
                    borderLeft:
                      service?.id === s.id
                        ? "4px solid black"
                        : "1px solid #eee",
                    boxShadow: 1,
                    "&:hover": {
                      boxShadow: 3,
                      bgcolor: service?.id === s.id ? "#444" : "#fafafa",
                    },
                  }}
                >
                  <CardActionArea onClick={() => setService(s)}>
                    <CardContent>
                      <Typography variant="h6">{s.name}</Typography>
                      {s.duration_minutes && (
                        <Typography variant="body2" sx={{ color: "gray" }}>
                          {s.duration_minutes} мин
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        {activeStep === 1 && (
          <Grid container spacing={2}>
            {branches.map((b) => (
              <Grid item xs={12} sm={6} key={b.id}>
                <Card
                  sx={{
                    bgcolor: branch?.id === b.id ? "#333" : "white",
                    color: branch?.id === b.id ? "white" : "black",
                    borderLeft:
                      branch?.id === b.id
                        ? "4px solid black"
                        : "1px solid #eee",
                    boxShadow: 1,
                    "&:hover": {
                      boxShadow: 3,
                      bgcolor: branch?.id === b.id ? "#444" : "#fafafa",
                    },
                  }}
                >
                  <CardActionArea onClick={() => setBranch(b)}>
                    <CardContent>
                      <Typography variant="h6">{b.title}</Typography>
                      {b.description && (
                        <Typography
                          variant="body2"
                          sx={{ color: branch?.id === b.id ? "white" : "gray" }}
                        >
                          {b.description}
                        </Typography>
                      )}
                      {b.phone && (
                        <Typography
                          variant="body2"
                          sx={{ color: branch?.id === b.id ? "white" : "gray" }}
                        >
                          Утас:{" "}
                          {Array.isArray(b.phone)
                            ? b.phone.join(", ")
                            : b.phone}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        {activeStep === 2 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <DatePicker
              label="Огноо сонгох"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              disablePast
              slotProps={{
                textField: {
                  fullWidth: false,
                  sx: { minWidth: 250 },
                },
              }}
            />
          </Box>
        )}
        {activeStep === 3 && (
          <Grid container spacing={1}>
            {generateTimeSlots().map((slot) => (
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
            ))}
          </Grid>
        )}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          sx={{
            borderRadius: "20px",
            borderColor: "#333",
            color: "#333",
            "&:hover": { borderColor: "#000", color: "#000" },
          }}
        >
          Буцах
        </Button>
        <Button
          onClick={handleNext}
          variant="contained"
          sx={{
            bgcolor: "#333",
            "&:hover": { bgcolor: "#000" },
            borderRadius: "20px",
            px: { xs: 2, md: 4 },
          }}
          disabled={
            (activeStep === 0 && !service) ||
            (activeStep === 1 && !branch) ||
            (activeStep === 2 && !date) ||
            (activeStep === 3 && !time)
          }
        >
          {activeStep === steps.length - 1 ? "Илгээх" : "Дараах"}
        </Button>
      </Box>
    </Box>
  );
}
