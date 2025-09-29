"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography, Paper } from "@mui/material";
import BranchList from "@/components/admin/BranchList";
import ManagersList from "@/components/admin/ManagerList";
import ServicesList from "@/components/admin/ServicesList";
import BookingSheet from "@/components/admin/BookingSheet";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("booking");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const manager = localStorage.getItem("manager");
    if (!manager) {
      router.push("/admin");
      return;
    }

    const parsed = JSON.parse(manager);
    setIsAdmin(parsed.is_admin);

    setActiveTab(parsed.is_admin ? "branch" : "booking");
  }, [router]);

  const logout = () => {
    localStorage.removeItem("manager");
    router.push("/admin");
  };

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">
          {isAdmin ? "Admin Dashboard" : "Manager Dashboard"}
        </Typography>
        <Button variant="outlined" color="error" onClick={logout}>
          Logout
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3}>
        {isAdmin && (
          <>
            <Button
              variant={activeTab === "branch" ? "contained" : "outlined"}
              onClick={() => setActiveTab("branch")}
            >
              Branches
            </Button>
            <Button
              variant={activeTab === "service" ? "contained" : "outlined"}
              onClick={() => setActiveTab("service")}
            >
              Services
            </Button>
            <Button
              variant={activeTab === "manager" ? "contained" : "outlined"}
              onClick={() => setActiveTab("manager")}
            >
              Managers
            </Button>
          </>
        )}

        <Button
          variant={activeTab === "booking" ? "contained" : "outlined"}
          onClick={() => setActiveTab("booking")}
        >
          Bookings
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        {activeTab === "branch" && <BranchList />}
        {activeTab === "service" && <ServicesList />}
        {activeTab === "manager" && <ManagersList />}
        {activeTab === "booking" && <BookingSheet />}
      </Paper>
    </Box>
  );
}
