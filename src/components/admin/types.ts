export type Branch = {
  id: string;
  title: string;
  address: string;
  phone: string;
  hours: string;
  bedsSkin: number;
  bedsHair: number;
  mapUrl?: string;
};

export type Service = {
  id: string;
  name: string;
  category: string;
  durationMin: number;
  kind: "skin" | "hair";
  description?: string;
};

export type BranchService = {
  branchId: string;
  serviceId: string;
  price: number;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Booking = {
  id: string;
  customerId?: string;
  customer: string;
  phone: string;
  branchId: string;
  serviceId: string;
  dateISO: string;
  time: string;
  partySize: number;
  status: BookingStatus;
  paid: boolean;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  tier: "standard" | "silver" | "gold";
  points: number;
};

export type Repo = {
  branches: {
    list: () => Branch[];
    upsert: (branch: Branch) => Branch;
    remove: (id: string) => void;
  };
  services: {
    list: () => Service[];
    upsert: (service: Service) => Service;
    remove: (id: string) => void;
  };
  pricing: {
    list: () => BranchService[];
    upsert: (price: BranchService) => BranchService;
    remove: (branchId: string, serviceId: string) => void;
  };
  bookings: {
    list: () => Booking[];
    upsert: (booking: Booking) => Booking;
    remove: (id: string) => void;
    setStatus: (id: string, status: Booking["status"]) => void;
    togglePaid: (id: string) => void;
    setTime: (id: string, time: string) => void;
  };
  customers: {
    list: () => Customer[];
    upsert: (customer: Customer) => Customer;
    remove: (id: string) => void;
  };
};
