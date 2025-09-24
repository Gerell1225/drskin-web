"use client";

import { Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";

export default function DayStep({
  date,
  setDate,
}: {
  date: Dayjs | null;
  setDate: (d: Dayjs | null) => void;
}) {
  return (
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
  );
}
