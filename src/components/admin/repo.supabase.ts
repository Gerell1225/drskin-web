import { createClient } from "@/lib/supabase";
import { Repo } from "./types";

// Placeholder implementation that mirrors repo.ts API.
// Swap imports in panels to use Supabase when ready.
export const supabaseRepo: Repo = {
  branches: {
    list: () => [],
    upsert: (branch) => branch,
    remove: () => {},
  },
  services: {
    list: () => [],
    upsert: (service) => service,
    remove: () => {},
  },
  pricing: {
    list: () => [],
    upsert: (price) => price,
    remove: () => {},
  },
  bookings: {
    list: () => [],
    upsert: (booking) => booking,
    remove: () => {},
    setStatus: () => {},
    togglePaid: () => {},
    setTime: () => {},
  },
  customers: {
    list: () => [],
    upsert: (customer) => customer,
    remove: () => {},
  },
};

void createClient; // keep lint happy until wired
