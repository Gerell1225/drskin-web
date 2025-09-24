"use client";

import { useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import { Dayjs } from "dayjs";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import BranchStep from "./BranchStep";
import ContactStep from "./ContactStep";
import DayStep from "./DayStep";
import ServiceStep from "./ServiceStep";
import TimeStep from "./TimeStep";

const steps = ["Service", "Branch", "Date", "Time", "Contact", "Confirm"];
interface Service {
  id: number;
  name: string;
  category: "skin" | "hair";
  duration: number;
}

interface Branch {
  id: number;
  title: string;
  description: string;
  phone: string[] | string | null;
  capacity_skin: number;
  capacity_hair: number;
}

export default function BookingForm() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const [service, setService] = useState<Service | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const router = useRouter();

  const handleSubmit = async () => {
    if (!service || !branch || !date || !time) return;

    const bookingDate = date.format("YYYY-MM-DD");
    const { error } = await supabase.from("bookings").insert([
      {
        service_id: service.id,
        branch_id: branch.id,
        date: bookingDate,
        start_time: time,
        customer_name: name,
        customer_phone: phone,
        status: "pending",
      },
    ]);

    if (error) {
      console.error("Insert error:", error.message);
      alert("Алдаа гарлаа!");
      return;
    }

    alert("Таны захиалга амжилттай илгээгдлээ!");
    router.push("/");
  };

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label} sx={{ px: { xs: 0.5, md: 1 } }}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: { xs: 2, md: 4 } }}>
        {activeStep === 0 && (
          <ServiceStep
            service={service}
            setService={(s: Service) => {
              setService(s);
              setActiveStep(1);
            }}
          />
        )}

        {activeStep === 1 && (
          <BranchStep
            service={service!}
            branch={branch}
            setBranch={(b) => {
              setBranch({
                ...b,
                phone: Array.isArray(b.phone)
                  ? b.phone
                  : b.phone
                    ? [b.phone]
                    : [],
              });
              setActiveStep(2);
            }}
          />
        )}

        {activeStep === 2 && (
          <DayStep
            date={date}
            setDate={(d) => {
              setDate(d);
              setActiveStep(3);
            }}
          />
        )}

        {activeStep === 3 && (
          <TimeStep
            service={service!}
            branch={branch!}
            date={date!}
            time={time}
            setTime={(t: string) => {
              setTime(t);
              setActiveStep(4);
            }}
          />
        )}

        {activeStep === 4 && (
          <ContactStep
            name={name}
            phone={phone}
            setName={setName}
            setPhone={setPhone}
          />
        )}

        {activeStep === 5 && (
          <Paper
            elevation={2}
            sx={{ p: 3, maxWidth: 420, mx: "auto", textAlign: "left" }}
          >
            <Typography variant="h6" gutterBottom>
              Захиалгын дэлгэрэнгүй
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>Үйлчилгээ: {service?.name}</Typography>
            <Typography>Салбар: {branch?.title}</Typography>
            <Typography>Огноо: {date?.format("YYYY-MM-DD")}</Typography>
            <Typography>Цаг: {time}</Typography>
            <Typography>Нэр: {name}</Typography>
            <Typography>Утас: {phone}</Typography>
          </Paper>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          mt: 4,
        }}
      >
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((p) => p - 1)}
          variant="outlined"
          sx={{
            flex: 1,
            borderRadius: 1.5,
            py: 1.2,
            fontWeight: 500,
            borderColor: "#333",
            color: "#333",
            textTransform: "none",
            "&:hover": { bgcolor: "#f5f5f5", borderColor: "#000" },
          }}
        >
          Буцах
        </Button>

        {activeStep < steps.length - 1 && (
          <Button
            onClick={() => setActiveStep((p) => p + 1)}
            variant="contained"
            disabled={
              (activeStep === 0 && !service) ||
              (activeStep === 1 && !branch) ||
              (activeStep === 2 && !date) ||
              (activeStep === 3 && !time) ||
              (activeStep === 4 && (!name || !phone))
            }
            sx={{
              flex: 1,
              borderRadius: 1.5,
              py: 1.2,
              fontWeight: 500,
              bgcolor: "#333",
              textTransform: "none",
              "&:hover": { bgcolor: "#000" },
            }}
          >
            Дараах
          </Button>
        )}

        {activeStep === steps.length - 1 && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              flex: 1,
              borderRadius: 1.5,
              py: 1.2,
              fontWeight: 500,
              bgcolor: "#333",
              textTransform: "none",
              "&:hover": { bgcolor: "#000" },
            }}
          >
            Илгээх
          </Button>
        )}
      </Box>
    </Box>
  );
}
