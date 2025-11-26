"use client";
import React, { useMemo, useState } from "react";

/** Types kept local to avoid import issues */
type Branch = { id: string; name: string; addr: string; phone: string; hours: string; mapUrl?: string };
type Service = { id: string; title: string; duration?: string; description?: string };
type BranchService = { id: string; branchId: string; serviceId: string; price: number; active: boolean };

const PRIMARY = "#D42121";
const formatMNT = (v: number) => new Intl.NumberFormat("mn-MN").format(v) + "₮";
const calcPoints = (price: number) => Math.floor(price / 10000);

/** Optional props (so you can pass real data later).
 * If not provided, we fallback to inline seeds (same as your data.mock.ts).
 */
export default function BookingForm(props: {
  branches?: Branch[];
  services?: Service[];
  branchServices?: BranchService[];
}) {
  const BRANCHES: Branch[] =
    props.branches ?? [
      { id: "b1", name: "DrSkin — Gem Mall", addr: "УБ, Gem Mall, 2-р давхар", phone: "77030808", hours: "Өдөр бүр 10:00–20:00", mapUrl: "https://maps.google.com/?q=Gem+Mall+Ulaanbaatar" },
      { id: "b2", name: "DrSkin — Хүннү", addr: "УБ, Хүннү Молл", phone: "77030808", hours: "Өдөр бүр 10:00–20:00" },
      { id: "b3", name: "DrHair — Центр", addr: "УБ, Төв гудамж", phone: "77030808", hours: "Өдөр бүр 10:00–20:00" },
    ];

  const SERVICES: Service[] =
    props.services ?? [
      { id: "s1", title: "Нүүр будалтын цэвэрлэгээ", duration: "30 мин", description: "Будгийн үлдэгдэл, бохирдлыг зөөлөн уусган цэвэрлэж арьсыг амраана." },
      { id: "s2", title: "Гүн цэвэрлэгээ (Ultra Peel)", duration: "45 мин", description: "Ultra Peel технологиор үхьмэл эсийг гуужуулж, сүв цэвэрлэнэ." },
      { id: "s3", title: "ENZYME Therapy", duration: "60 мин", description: "Ферментэн маск + лимфийн дагуух иллэг." },
      { id: "s4", title: "Арьс чангалах HIFU", duration: "60–90 мин" },
      { id: "s5", title: "Үсний SPA", duration: "45 мин" },
    ];

  const BRANCH_SERVICES: BranchService[] =
    props.branchServices ?? [
      { id: "bs-1", branchId: "b1", serviceId: "s1", price: 59000, active: true },
      { id: "bs-2", branchId: "b1", serviceId: "s2", price: 89000, active: true },
      { id: "bs-3", branchId: "b2", serviceId: "s1", price: 69000, active: true },
      { id: "bs-4", branchId: "b2", serviceId: "s4", price: 259000, active: true },
      { id: "bs-5", branchId: "b3", serviceId: "s5", price: 79000, active: true },
    ];

  const [branchId, setBranchId] = useState(BRANCHES[0]?.id ?? "");
  const [serviceId, setServiceId] = useState("");

  const servicesForBranch = useMemo(() => {
    const ids = new Set(
      BRANCH_SERVICES.filter((bs) => bs.branchId === branchId && bs.active).map((bs) => bs.serviceId)
    );
    return SERVICES.filter((s) => ids.has(s.id));
  }, [branchId]);

  const priceFor = (bId: string, sId: string): number | null => {
    const item = BRANCH_SERVICES.find((bs) => bs.branchId === bId && bs.serviceId === sId && bs.active);
    return item ? item.price : null;
  };

  const price = serviceId ? priceFor(branchId, serviceId) : null;
  const svc = SERVICES.find((s) => s.id === serviceId);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // placeholder only — next step we’ll POST to /api/booking and/or open QPay
    alert("Demo: Захиалга илгээгдлээ (API холболт дараа).");
  }

  return (
    <section id="booking" className="py-16 md:py-24">
      <div className="mx-auto max-w-[900px] px-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Онлайн захиалга</h2>
        <p className="text-sm md:text-base text-gray-600 mt-2">
          Салбар болон үйлчилгээгээ сонгоход үнийн мэдээлэл автоматаар шинэчлэгдэнэ.
        </p>

        <div className="mt-6 rounded-2xl border p-4 md:p-6 shadow-sm bg-white/80 backdrop-blur">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Салбар</label>
              <select
                className="mt-2 w-full rounded-xl border px-3 py-2.5"
                value={branchId}
                onChange={(e) => {
                  setBranchId(e.target.value);
                  setServiceId("");
                }}
              >
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Үйлчилгээ</label>
              <select
                className="mt-2 w-full rounded-xl border px-3 py-2.5"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
              >
                <option value="">— Сонгох —</option>
                {servicesForBranch.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>

              {price !== null && (
                <p className="mt-2 text-sm text-gray-700">
                  Үнэ: <span className="font-medium">{formatMNT(price)}</span>
                </p>
              )}
              {svc?.description && <p className="mt-1 text-xs text-gray-600">{svc.description}</p>}
              {price !== null && (
                <p className="mt-1 text-xs text-gray-600">
                  Энэ захиалгаар авах оноо: <span className="font-semibold">+{calcPoints(price)}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Огноо</label>
              <input type="date" className="mt-2 w-full rounded-xl border px-3 py-2.5" required />
            </div>
            <div>
              <label className="text-sm font-medium">Цаг</label>
              <input type="time" className="mt-2 w-full rounded-xl border px-3 py-2.5" required />
            </div>
            <div>
              <label className="text-sm font-medium">Нэр</label>
              <input placeholder="Овог, Нэр" className="mt-2 w-full rounded-xl border px-3 py-2.5" required />
            </div>
            <div>
              <label className="text-sm font-medium">Утас</label>
              <input placeholder="9xxxxxxx" className="mt-2 w-full rounded-xl border px-3 py-2.5" required />
            </div>

            <div className="md:col-span-2 flex items-center justify-between gap-3">
              <p className="text-xs md:text-sm text-gray-600">
                Төлбөр QPay-аар баталгаажина. (Одоогоор демо)
              </p>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-medium"
                style={{ background: PRIMARY }}
              >
                Захиалга баталгаажуулах
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
