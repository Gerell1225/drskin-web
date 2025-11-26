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
  listBranches: () => Branch[];
  upsertBranch: (branch: Branch) => Branch;
  removeBranch: (id: string) => void;

  listServices: () => Service[];
  upsertService: (service: Service) => Service;
  removeService: (id: string) => void;

  listPrices: () => BranchService[];
  upsertPrice: (price: BranchService) => BranchService;
  removePrice: (branchId: string, serviceId: string) => void;

  listBookings: () => Booking[];
  upsertBooking: (booking: Booking) => Booking;
  removeBooking: (id: string) => void;

  listCustomers: () => Customer[];
  upsertCustomer: (customer: Customer) => Customer;
  removeCustomer: (id: string) => void;
};
