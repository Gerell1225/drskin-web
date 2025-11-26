"use client";

import { useState, useMemo } from "react";
import { repo } from "./repo";
import { Booking } from "./types";
import { Modal } from "./ui/Modal";
import { Toast } from "./ui/Toast";
import { bookingSchema, bookingCapacityOk, priceLookup, formatMoney } from "./utils";


export function BookingsPanel() {
  const [bookings, setBookings] = useState(repo.listBookings());
  const [branches] = useState(repo.listBranches());
  const [services] = useState(repo.listServices());
  const [prices] = useState(repo.listPrices());
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return bookings.filter((b) => (selectedBranch === "all" || b.branchId === selectedBranch) && b.dateISO === selectedDate);
  }, [bookings, selectedBranch, selectedDate]);

  const grouped = useMemo(() => {
    const byBranch: Record<string, Booking[]> = {};
    filtered.forEach((b) => {
      byBranch[b.branchId] = byBranch[b.branchId] ? [...byBranch[b.branchId], b] : [b];
    });
    return byBranch;
  }, [filtered]);

  const openNew = () => {
    setEditing({
      id: crypto.randomUUID(),
      customer: "",
      phone: "",
      branchId: branches[0]?.id ?? "",
      serviceId: services[0]?.id ?? "",
      dateISO: selectedDate,
      time: "13:00",
      partySize: 1,
      status: "pending",
      paid: false,
    });
    setModalOpen(true);
  };

  const onSave = (formData: FormData) => {
    const parsed = bookingSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      setError(parsed.error.issues?.[0]?.message ?? "Алдаа гарлаа");
      return;
    }
    const payload = parsed.data as Booking;
    const branch = branches.find((b) => b.id === payload.branchId);
    const service = services.find((s) => s.id === payload.serviceId);
    if (!branch || !service) {
      setError("Салбар эсвэл үйлчилгээ буруу сонгогдсон");
      return;
    }
    if (!bookingCapacityOk(payload, bookings.filter((b) => b.id !== payload.id), branch, service)) {
      setError("Багтаамж дүүрсэн");
      return;
    }
    repo.upsertBooking(payload);
    setBookings(repo.listBookings());
    setToast("Захиалга хадгаллаа");
    setModalOpen(false);
    setError(null);
  };

  const inlineUpdate = (booking: Booking) => {
    repo.upsertBooking(booking);
    setBookings(repo.listBookings());
  };

  const togglePaid = async (booking: Booking) => {
    const endpoint = booking.paid ? "/api/qpay/refund" : "/api/qpay/invoice";
    await fetch(endpoint, { method: "POST", body: JSON.stringify({ bookingId: booking.id }) });
    inlineUpdate({ ...booking, paid: !booking.paid });
    setToast(booking.paid ? "Төлбөр буцаалаа" : "Төлбөр баталгаажсан");
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Захиалгууд</h2>
          <p className="text-sm text-gray-600">Салбар, өдөр, төлөв, төлбөр.</p>
        </div>
        <button onClick={openNew} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm">
          + Захиалга
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <label className="text-sm">
          Салбар
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="mt-1 w-full rounded-lg border p-2 text-sm"
          >
            <option value="all">Бүгд</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Өдөр
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1 w-full rounded-lg border p-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4">
        {Object.entries(grouped).map(([branchId, list]) => {
          const branch = branches.find((b) => b.id === branchId);
          return (
            <div key={branchId} className="rounded-xl border bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <div className="font-semibold">{branch?.title ?? "Салбар"}</div>
                <div className="text-sm text-gray-600">{branch?.hours}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="p-3">Цаг</th>
                      <th className="p-3">Үйлчилгээ</th>
                      <th className="p-3">Нэр</th>
                      <th className="p-3">Утас</th>
                      <th className="p-3">Зочин</th>
                      <th className="p-3">Төлөв</th>
                      <th className="p-3">Төлбөр</th>
                      <th className="p-3">Үнэ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((bk) => {
                        const service = services.find((s) => s.id === bk.serviceId);
                        const price = priceLookup(prices, bk.branchId, bk.serviceId);
                        return (
                          <tr key={bk.id} className="border-t">
                            <td className="p-3">
                              <input
                                className="rounded-lg border px-2 py-1"
                                value={bk.time}
                                onChange={(e) => inlineUpdate({ ...bk, time: e.target.value })}
                                type="time"
                              />
                            </td>
                            <td className="max-w-[160px] truncate p-3">{service?.name}</td>
                            <td className="max-w-[140px] truncate p-3 font-medium">{bk.customer}</td>
                            <td className="p-3">{bk.phone}</td>
                            <td className="p-3">{bk.partySize}</td>
                            <td className="p-3">
                              <select
                                className="rounded-lg border px-2 py-1"
                                value={bk.status}
                                onChange={(e) => inlineUpdate({ ...bk, status: e.target.value as Booking["status"] })}
                              >
                                <option value="pending">Хүлээгдэж</option>
                                <option value="confirmed">Батлагдсан</option>
                                <option value="cancelled">Цуцлагдсан</option>
                              </select>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => togglePaid(bk)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  bk.paid ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                                }`}
                              >
                                {bk.paid ? "Төлсөн" : "Төлөөгүй"}
                              </button>
                            </td>
                            <td className="p-3 font-medium">{price ? formatMoney(price) : "—"}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        {Object.keys(grouped).length === 0 && (
          <div className="rounded-xl border bg-white p-6 text-center text-gray-600 shadow-sm">Тухайн өдөрт бичлэг алга.</div>
        )}
      </div>

      <Modal open={modalOpen} title="Захиалга нэмэх" onClose={() => setModalOpen(false)}>
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <form className="grid gap-3" action={onSave}>
          <input type="hidden" name="id" defaultValue={editing?.id} />
          <label className="grid gap-1 text-sm">
            Өдөр
            <input name="dateISO" type="date" defaultValue={editing?.dateISO} className="rounded-lg border p-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Цаг
            <input name="time" type="time" defaultValue={editing?.time} className="rounded-lg border p-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Салбар
            <select name="branchId" defaultValue={editing?.branchId} className="rounded-lg border p-2">
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Үйлчилгээ
            <select name="serviceId" defaultValue={editing?.serviceId} className="rounded-lg border p-2">
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Захиалагч
            <input name="customer" defaultValue={editing?.customer} className="rounded-lg border p-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Утас
            <input name="phone" defaultValue={editing?.phone} className="rounded-lg border p-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Хүний тоо
            <input name="partySize" type="number" defaultValue={editing?.partySize} className="rounded-lg border p-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Төлөв
            <select name="status" defaultValue={editing?.status} className="rounded-lg border p-2">
              <option value="pending">Хүлээгдэж</option>
              <option value="confirmed">Батлагдсан</option>
              <option value="cancelled">Цуцлагдсан</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="paid" defaultChecked={editing?.paid} /> Төлбөр төлсөн
          </label>
          <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Хадгалах</button>
        </form>
      </Modal>

      <Toast message={toast} />
    </section>
  );
}
