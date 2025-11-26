import { z } from "zod";
import { Branch, BranchService, Booking, Service } from "./types";

export const cls = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("mn-MN", { style: "currency", currency: "MNT", maximumFractionDigits: 0 }).format(value);

export const branchSchema = z.object({
  id: z.string(),
  title: z.string().min(2, "Салбарын нэр оруулна уу"),
  address: z.string().min(6, "Хаяг заавал"),
  phone: z.string().min(6, "Утас"),
  hours: z.string().min(3, "Цагийн хуваарь"),
  bedsSkin: z.coerce.number().int().min(0),
  bedsHair: z.coerce.number().int().min(0),
  mapUrl: z.string().url().optional().or(z.literal("")),
});

export const serviceSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Нэр заавал"),
  category: z.string().min(2, "Ангилал"),
  durationMin: z.coerce.number().int().min(15),
  kind: z.enum(["skin", "hair"]),
  description: z.string().optional(),
});

export const priceSchema = z.object({
  branchId: z.string().min(1),
  serviceId: z.string().min(1),
  price: z.coerce.number().nonnegative(),
});

export const bookingSchema = z.object({
  id: z.string(),
  customer: z.string().min(2),
  phone: z.string().min(6),
  branchId: z.string(),
  serviceId: z.string(),
  dateISO: z.string(),
  time: z.string(),
  partySize: z.coerce.number().int().min(1),
  status: z.enum(["pending", "confirmed", "cancelled"]),
  paid: z.preprocess((val) => val === "on" || val === true || val === "true", z.boolean()),
});

export const bookingCapacityOk = (
  booking: Booking,
  existing: Booking[],
  branch: Branch,
  service: Service,
): boolean => {
  const capacity = service.kind === "skin" ? branch.bedsSkin : branch.bedsHair;
  const booked = existing
    .filter((b) => b.branchId === booking.branchId && b.serviceId === booking.serviceId && b.time === booking.time && b.dateISO === booking.dateISO)
    .reduce((sum, b) => sum + b.partySize, 0);
  return booked + booking.partySize <= capacity;
};

export const priceLookup = (prices: BranchService[], branchId: string, serviceId: string): number | null => {
  const match = prices.find((p) => p.branchId === branchId && p.serviceId === serviceId);
  return match ? match.price : null;
};
