"use client";
import { ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <CssBaseline />
      {children}
    </>
  );
}
