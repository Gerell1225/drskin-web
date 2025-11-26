import { branchServices, branches, bookings, customers, services } from "./data.mock";
import { Booking, Branch, BranchService, Customer, Service } from "./types";

const clone = <T>(items: T[]): T[] => JSON.parse(JSON.stringify(items));

const state = {
  branches: clone(branches),
  services: clone(services),
  prices: clone(branchServices),
  bookings: clone(bookings),
  customers: clone(customers),
};

const upsert = <T>(list: T[], item: T, match: (existing: T) => boolean) => {
  const index = list.findIndex(match);
  if (index >= 0) {
    list[index] = { ...item } as T;
  } else {
    list.push({ ...item } as T);
  }
};

export const repo = {
  branches: {
    list: () => clone(state.branches),
    upsert: (branch: Branch) => {
      upsert(state.branches, branch, (b) => b.id === branch.id);
      state.prices = state.prices.filter((p) => state.branches.some((b) => b.id === p.branchId));
      state.bookings = state.bookings.filter((b) => state.branches.some((br) => br.id === b.branchId));
      return branch;
    },
    remove: (id: string) => {
      state.branches = state.branches.filter((b) => b.id !== id);
      state.prices = state.prices.filter((p) => p.branchId !== id);
      state.bookings = state.bookings.filter((b) => b.branchId !== id);
    },
  },
  services: {
    list: () => clone(state.services),
    upsert: (service: Service) => {
      upsert(state.services, service, (s) => s.id === service.id);
      state.prices = state.prices.filter((p) => state.services.some((s) => s.id === p.serviceId));
      state.bookings = state.bookings.filter((b) => state.services.some((s) => s.id === b.serviceId));
      return service;
    },
    remove: (id: string) => {
      state.services = state.services.filter((s) => s.id !== id);
      state.prices = state.prices.filter((p) => p.serviceId !== id);
      state.bookings = state.bookings.filter((b) => b.serviceId !== id);
    },
  },
  pricing: {
    list: () => clone(state.prices),
    upsert: (price: BranchService) => {
      upsert(state.prices, price, (p) => p.branchId === price.branchId && p.serviceId === price.serviceId);
      return price;
    },
    remove: (branchId: string, serviceId: string) => {
      state.prices = state.prices.filter((p) => !(p.branchId === branchId && p.serviceId === serviceId));
    },
  },
  bookings: {
    list: () => clone(state.bookings),
    upsert: (booking: Booking) => {
      upsert(state.bookings, booking, (b) => b.id === booking.id);
      return booking;
    },
    remove: (id: string) => {
      state.bookings = state.bookings.filter((b) => b.id !== id);
    },
    setStatus: (id: string, status: Booking["status"]) => {
      const booking = state.bookings.find((b) => b.id === id);
      if (booking) booking.status = status;
    },
    togglePaid: (id: string) => {
      const booking = state.bookings.find((b) => b.id === id);
      if (booking) booking.paid = !booking.paid;
    },
    setTime: (id: string, time: string) => {
      const booking = state.bookings.find((b) => b.id === id);
      if (booking) booking.time = time;
    },
  },
  customers: {
    list: () => clone(state.customers),
    upsert: (customer: Customer) => {
      upsert(state.customers, customer, (c) => c.id === customer.id);
      return customer;
    },
    remove: (id: string) => {
      state.customers = state.customers.filter((c) => c.id !== id);
    },
  },
};
