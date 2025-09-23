"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Tabs, Tab, Box, CircularProgress } from "@mui/material";
import BranchesTable from "@/app/admin/components/BranchesTable";
import ManagersTable from "@/app/admin/components/ManagersTable";
import ServicesTable from "@/app/admin/components/ServicesTable";
import BookingsTable from "@/app/admin/components/BookingsTable";

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const r = localStorage.getItem("role");
    if (!r) {
      router.push("/admin/login");
    } else {
      setRole(r);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 10 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 3 }}>
        <Tab label="Салбарууд" />
        <Tab label="Менежерүүд" />
        <Tab label="Үйлчилгээнүүд" />
        <Tab label="Захиалгууд" />
      </Tabs>

      <Box hidden={tab !== 0}>
        <BranchesTable />
      </Box>
      <Box hidden={tab !== 1}>
        <ManagersTable />
      </Box>
      <Box hidden={tab !== 2}>
        <ServicesTable />
      </Box>
      <Box hidden={tab !== 3}>
        <BookingsTable />
      </Box>
    </Container>
  );
}
