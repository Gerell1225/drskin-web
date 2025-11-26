"use client";
import { useMemo, useSyncExternalStore } from "react";
import { BRANCHES_SEED, SERVICES_SEED, BRANCH_SERVICES_SEED, BOOKINGS_SEED } from "./data.mock";
import type { Branch, Service, BranchService, Booking } from "./types";

type DB = {
  branches: Branch[];
  services: Service[];
  branchServices: BranchService[];
  bookings: Booking[];
};

let state: DB = {
  branches: [...BRANCHES_SEED],
  services: [...SERVICES_SEED],
  branchServices: [...BRANCH_SERVICES_SEED],
  bookings: [...BOOKINGS_SEED],
};

const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
export function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }
export function getSnapshot() { return state; }

function uid(prefix: string) { return `${prefix}-${Math.random().toString(36).slice(2, 8)}`; }

export function useAdminStore() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return useMemo(() => ({
    ...snap,
    // Branches
    addBranch: (b: Omit<Branch, "id">) => { state = { ...state, branches: [...state.branches, { ...b, id: uid("b") }] }; emit(); },
    updateBranch: (id: string, patch: Partial<Branch>) => { state = { ...state, branches: state.branches.map(x => x.id === id ? { ...x, ...patch } : x) }; emit(); },
    removeBranch: (id: string) => {
      state = {
        ...state,
        branches: state.branches.filter(x => x.id !== id),
        branchServices: state.branchServices.filter(bs => bs.branchId !== id),
        bookings: state.bookings.filter(bk => bk.branchId !== id),
      }; emit();
    },

    // Services
    addService: (s: Omit<Service, "id">) => { state = { ...state, services: [...state.services, { ...s, id: uid("s") }] }; emit(); },
    updateService: (id: string, patch: Partial<Service>) => { state = { ...state, services: state.services.map(x => x.id === id ? { ...x, ...patch } : x) }; emit(); },
    removeService: (id: string) => {
      state = {
        ...state,
        services: state.services.filter(x => x.id !== id),
        branchServices: state.branchServices.filter(bs => bs.serviceId !== id),
        bookings: state.bookings.filter(bk => bk.serviceId !== id),
      }; emit();
    },

    // BranchServices (availability & price)
    setBranchService: (branchId: string, serviceId: string, price: number, active: boolean) => {
      const exist = state.branchServices.find(bs => bs.branchId === branchId && bs.serviceId === serviceId);
      if (exist) {
        exist.price = price; exist.active = active;
        state = { ...state, branchServices: [...state.branchServices] };
      } else {
        state = { ...state, branchServices: [...state.branchServices, { id: uid("bs"), branchId, serviceId, price, active }] };
      }
      emit();
    },
    removeBranchService: (id: string) => { state = { ...state, branchServices: state.branchServices.filter(x => x.id !== id) }; emit(); },

    // Bookings
    addBooking: (b: Omit<Booking, "id" | "status"> & { status?: Booking["status"] }) => {
      state = { ...state, bookings: [...state.bookings, { ...b, id: uid("bk"), status: b.status ?? "pending" }] }; emit();
    },
    updateBooking: (id: string, patch: Partial<Booking>) => { state = { ...state, bookings: state.bookings.map(x => x.id === id ? { ...x, ...patch } : x) }; emit(); },
    removeBooking: (id: string) => { state = { ...state, bookings: state.bookings.filter(x => x.id !== id) }; emit(); },
  }), [snap]);
}
