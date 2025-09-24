"use client";

import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { supabase } from "@/lib/supabaseClient";

interface Branch {
  id: number;
  title: string;
  description: string;
  phone?: string | string[] | null;
  capacity_skin: number;
  capacity_hair: number;
}

interface Service {
  id: number;
  name: string;
  category: "skin" | "hair";
  duration: number;
}

export default function BranchStep({
  service,
  branch,
  setBranch,
}: {
  service: Service;
  branch: Branch | null;
  setBranch: (b: Branch) => void;
}) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("branches").select("*");
      if (error) console.error(error);

      const filtered = (data || []).filter((b: Branch) =>
        service.category === "skin" ? b.capacity_skin > 0 : b.capacity_hair > 0,
      );

      setBranches(filtered);
      setLoading(false);
    };
    fetchBranches();
  }, [service]);

  if (loading) return <CircularProgress />;

  return (
    <Grid container spacing={2}>
      {branches.map((b) => {
        const phoneText = Array.isArray(b.phone)
          ? b.phone.join(", ")
          : b.phone || "";

        return (
          <Grid item xs={12} sm={6} key={b.id}>
            <Card
              sx={{
                height: "100%",
                minHeight: { xs: 160, md: 200 },
                display: "flex",
                flexDirection: "column",
                bgcolor: branch?.id === b.id ? "#333" : "white",
                color: branch?.id === b.id ? "white" : "black",
                borderLeft:
                  branch?.id === b.id ? "4px solid black" : "1px solid #eee",
                boxShadow: 1,
                "&:hover": {
                  boxShadow: 3,
                  bgcolor: branch?.id === b.id ? "#444" : "#fafafa",
                },
              }}
            >
              <CardActionArea
                sx={{ height: "100%" }}
                onClick={() => setBranch(b)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{b.title}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {b.description}
                  </Typography>
                  {phoneText && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: branch?.id === b.id ? "white" : "gray",
                      }}
                    >
                      Утас: {phoneText}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
