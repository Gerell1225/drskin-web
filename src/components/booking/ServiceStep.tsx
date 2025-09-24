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

interface Service {
  id: number;
  name: string;
  category: "skin" | "hair";
  duration: number;
}

export default function ServiceStep({
  service,
  setService,
}: {
  service: Service | null;
  setService: (s: Service) => void;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("services").select("*");
      if (error) console.error(error);
      setServices(data || []);
      setLoading(false);
    };
    fetchServices();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Grid container spacing={2}>
      {services.map((s) => (
        <Grid item xs={12} sm={6} key={s.id}>
          <Card
            sx={{
              height: "100%",
              minHeight: { xs: 100, md: 200 },
              display: "flex",
              flexDirection: "column",
              bgcolor: service?.id === s.id ? "#333" : "white",
              color: service?.id === s.id ? "white" : "black",
              borderLeft:
                service?.id === s.id ? "4px solid black" : "1px solid #eee",
              boxShadow: 1,
              "&:hover": {
                boxShadow: 3,
                bgcolor: service?.id === s.id ? "#444" : "#fafafa",
              },
            }}
          >
            <CardActionArea
              sx={{ height: "100%" }}
              onClick={() => setService(s)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{s.name}</Typography>
                <Typography variant="body2" sx={{ color: "gray" }}>
                  {s.duration} мин • {s.category === "skin" ? "Арьс" : "Үс"}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
