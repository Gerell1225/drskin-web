import { Branch, BranchService, Booking, Customer, Service } from "./types";

export const branches: Branch[] = [
  {
    id: "b1",
    title: "DrSkin Central",
    address: "Peace Ave 45, Sukhbaatar",
    phone: "+976-7711-0011",
    hours: "09:00-21:00",
    bedsSkin: 4,
    bedsHair: 3,
    mapUrl: "https://maps.app.goo.gl/demo1",
  },
  {
    id: "b2",
    title: "DrHair West",
    address: "Chingeltei 1-23",
    phone: "+976-7711-0022",
    hours: "10:00-20:00",
    bedsSkin: 2,
    bedsHair: 5,
    mapUrl: "https://maps.app.goo.gl/demo2",
  },
];

export const services: Service[] = [
  {
    id: "s1",
    name: "Hydrafacial",
    category: "Skin renewal",
    durationMin: 60,
    kind: "skin",
    description: "Deep cleanse, extract, hydrate for glowing skin.",
  },
  {
    id: "s2",
    name: "Scalp detox",
    category: "Hair care",
    durationMin: 45,
    kind: "hair",
    description: "Purifying scalp treatment for healthy growth.",
  },
];

export const branchServices: BranchService[] = [
  { branchId: "b1", serviceId: "s1", price: 95000 },
  { branchId: "b1", serviceId: "s2", price: 85000 },
  { branchId: "b2", serviceId: "s2", price: 78000 },
];

export const customers: Customer[] = [
  { id: "c1", name: "Төгөлдөр", phone: "+976-99112233", tier: "silver", points: 12000 },
  { id: "c2", name: "Анударь", phone: "+976-98117755", tier: "standard", points: 2300 },
];

export const bookings: Booking[] = [
  {
    id: "bk1",
    customerId: "c1",
    customer: "Төгөлдөр",
    phone: "+976-99112233",
    branchId: "b1",
    serviceId: "s1",
    dateISO: new Date().toISOString().slice(0, 10),
    time: "13:00",
    partySize: 2,
    status: "confirmed",
    paid: true,
  },
  {
    id: "bk2",
    customerId: "c2",
    customer: "Анударь",
    phone: "+976-98117755",
    branchId: "b2",
    serviceId: "s2",
    dateISO: new Date().toISOString().slice(0, 10),
    time: "15:00",
    partySize: 1,
    status: "pending",
    paid: false,
  },
];
