import type { Branch, Service, BranchService, Booking } from "./types";

export const BRANCHES_SEED: Branch[] = [
  {
    id: "b1",
    name: "DrSkin — Gem Mall",
    addr: "УБ, Gem Mall, 2-р давхар",
    phone: "77030808",
    hours: "Өдөр бүр 10:00–20:00",
    mapUrl: "https://maps.google.com/?q=Gem+Mall+Ulaanbaatar",
  },
  {
    id: "b2",
    name: "DrSkin — Хүннү",
    addr: "УБ, Хүннү Молл",
    phone: "77030808",
    hours: "Өдөр бүр 10:00–20:00",
  },
  {
    id: "b3",
    name: "DrHair — Центр",
    addr: "УБ, Төв гудамж",
    phone: "77030808",
    hours: "Өдөр бүр 10:00–20:00",
  },
];

export const SERVICES_SEED: Service[] = [
  {
    id: "s1",
    title: "Нүүр будалтын цэвэрлэгээ",
    duration: "30 мин",
    description:
      "Будгийн үлдэгдэл, бохирдлыг зөөлөн уусган цэвэрлэж арьсыг амраана.",
  },
  {
    id: "s2",
    title: "Гүн цэвэрлэгээ (Ultra Peel)",
    duration: "45 мин",
    description:
      "Ultra Peel технологиор үхьмэл эсийг гуужуулж, сүв цэвэрлэнэ.",
  },
  {
    id: "s3",
    title: "ENZYME Therapy",
    duration: "60 мин",
    description: "Ферментэн маск + лимфийн дагуух иллэг.",
  },
  {
    id: "s4",
    title: "Арьс чангалах HIFU",
    duration: "60–90 мин",
    description: "Өндөр давтамжит фокус долгионы арчилгаа.",
  },
  {
    id: "s5",
    title: "Үсний SPA",
    duration: "45 мин",
    description: "Толгой арьс арчилгаа, гүн чийгшүүлэх.",
  },
];

export const BRANCH_SERVICES_SEED: BranchService[] = [
  { id: "bs-1", branchId: "b1", serviceId: "s1", price: 59000, active: true },
  { id: "bs-2", branchId: "b1", serviceId: "s2", price: 89000, active: true },
  { id: "bs-3", branchId: "b2", serviceId: "s1", price: 69000, active: true },
  { id: "bs-4", branchId: "b2", serviceId: "s4", price: 259000, active: true },
  { id: "bs-5", branchId: "b3", serviceId: "s5", price: 79000, active: true },
];

export const BOOKINGS_SEED: Booking[] = [
  {
    id: "bk-1",
    branchId: "b1",
    serviceId: "s1",
    dateISO: "2025-11-28",
    time: "12:00",
    customerName: "Зочин 1",
    phone: "99000000",
    status: "confirmed",
    price: 59000,
  },
  {
    id: "bk-2",
    branchId: "b2",
    serviceId: "s4",
    dateISO: "2025-11-29",
    time: "15:30",
    customerName: "Зочин 2",
    phone: "99111111",
    status: "pending",
    price: 259000,
  },
];
