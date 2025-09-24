"use client";

import { useState } from "react";
import { Box, Stepper, Step, StepLabel, Button } from "@mui/material";
import { Dayjs } from "dayjs";
import { supabase } from "@/lib/supabaseClient";
import BranchStep from "./BranchStep";
import ContactStep from "./ContactStep";
import DayStep from "./DayStep";
import ServiceStep from "./ServiceStep";
import TimeStep from "./TimeStep";

const steps = ["Үйлчилгээ", "Салбар", "Огноо", "Цаг", "Холбоо барих"];

export default function BookingForm() {
  const [activeStep, setActiveStep] = useState(0);

  const [service, setService] = useState<any | null>(null);
  const [branch, setBranch] = useState<any | null>(null);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

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

    alert(
      `Амжилттай бүртгэгдлээ!\n\n` +
        `Үйлчилгээ: ${service?.name}\n` +
        `Салбар: ${branch?.title}\n` +
        `Огноо: ${date?.format("YYYY-MM-DD")}\n` +
        `Цаг: ${time}\n` +
        `Нэр: ${name}\n` +
        `Утас: ${phone}`,
    );
    setActiveStep(0);
    setService(null);
    setBranch(null);
    setDate(null);
    setTime(null);
    setName("");
    setPhone("");
  };

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
          <ServiceStep
            service={service}
            setService={(s) => {
              setService(s);
              setActiveStep(1);
            }}
          />
        )}

        {activeStep === 1 && (
          <BranchStep
            service={service}
            branch={branch}
            setBranch={(b) => {
              setBranch(b);
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
            service={service}
            branch={branch}
            date={date}
            time={time}
            setTime={(t) => {
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
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 4,
          gap: 2,
        }}
      >
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((p) => p - 1)}
          variant="outlined"
          sx={{
            flex: 1,
            borderRadius: 2,
            py: 1.5,
            fontWeight: 600,
            borderColor: "#333",
            color: "#333",
            textTransform: "none",
            fontSize: { xs: "0.9rem", md: "1rem" },
            "&:hover": {
              bgcolor: "#333",
              color: "white",
              borderColor: "#000",
            },
          }}
        >
          Буцах
        </Button>

        {activeStep === steps.length - 1 && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!name || !phone}
            sx={{
              flex: 1,
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              bgcolor: "#333",
              color: "white",
              textTransform: "none",
              fontSize: { xs: "0.9rem", md: "1rem" },
              "&:hover": {
                bgcolor: "#000",
              },
              "&.Mui-disabled": {
                bgcolor: "#aaa",
                color: "#fff",
              },
            }}
          >
            Илгээх
          </Button>
        )}
      </Box>
    </Box>
  );
}
