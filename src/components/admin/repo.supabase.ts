import { createClient } from "@/lib/supabase";
import { Repo } from "./types";

// Placeholder implementation that mirrors repo.ts API.
// Swap imports in panels to use Supabase when ready.
export const supabaseRepo: Repo = {
  listBranches: () => [],
  upsertBranch: (branch) => branch,
  removeBranch: () => {},

  listServices: () => [],
  upsertService: (service) => service,
  removeService: () => {},

  listPrices: () => [],
  upsertPrice: (price) => price,
  removePrice: () => {},

  listBookings: () => [],
  upsertBooking: (booking) => booking,
  removeBooking: () => {},

  listCustomers: () => [],
  upsertCustomer: (customer) => customer,
  removeCustomer: () => {},
};

void createClient; // keep lint happy until wired
