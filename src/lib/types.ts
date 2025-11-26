export type Branch = {
  id: string;
  name: string;
  addr: string;
  phone: string;
  hours: string;
  mapUrl?: string;
};

export type Service = {
  id: string;
  title: string;
  duration?: string;
  description?: string;
};

export type BranchService = {
  id: string;           // unique row id
  branchId: string;
  serviceId: string;
  price: number;
  active: boolean;      // whether this service is offered at this branch
};

export type Booking = {
  id: string;
  branchId: string;
  serviceId: string;
  dateISO: string;      // YYYY-MM-DD
  time: string;         // HH:mm
  customerName: string;
  phone: string;
  status: "pending" | "confirmed" | "cancelled";
  price?: number;
};
