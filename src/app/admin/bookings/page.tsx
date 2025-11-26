"use client";
import { useMemo, useState } from "react";
import { useAdminStore } from "@/lib/admin.store";

export default function BookingsPage() {
  const { branches, services, branchServices, bookings, addBooking, updateBooking, removeBooking } = useAdminStore();

  const [filterBranch, setFilterBranch] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");

  const filtered = useMemo(() => {
    return bookings.filter(bk =>
      (filterBranch === "all" || bk.branchId === filterBranch) &&
      (!filterDate || bk.dateISO === filterDate)
    );
  }, [bookings, filterBranch, filterDate]);

  const priceFor = (branchId: string, serviceId: string) =>
    branchServices.find(x => x.branchId === branchId && x.serviceId === serviceId)?.price ?? undefined;

  const [form, setForm] = useState({
    branchId: branches[0]?.id ?? "",
    serviceId: services[0]?.id ?? "",
    dateISO: "",
    time: "",
    customerName: "",
    phone: "",
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Захиалгууд</h1>

      <div className="card p-4 grid md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Салбараар шүүх</label>
          <select className="mt-2 w-full rounded-xl border px-3 py-2.5" value={filterBranch} onChange={e=>setFilterBranch(e.target.value)}>
            <option value="all">Бүгд</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Өдөрөөр шүүх</label>
          <input type="date" className="mt-2 w-full rounded-xl border px-3 py-2.5" value={filterDate} onChange={e=>setFilterDate(e.target.value)} />
        </div>
      </div>

      <div className="card p-4">
        <p className="font-medium">Шинэ захиалга нэмэх</p>
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          <select className="rounded-xl border px-3 py-2.5" value={form.branchId} onChange={e=>setForm(s=>({...s,branchId:e.target.value}))}>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select className="rounded-xl border px-3 py-2.5" value={form.serviceId} onChange={e=>setForm(s=>({...s,serviceId:e.target.value}))}>
            {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <input className="rounded-xl border px-3 py-2.5" placeholder="Нэр" value={form.customerName} onChange={e=>setForm(s=>({...s,customerName:e.target.value}))}/>
          <input className="rounded-xl border px-3 py-2.5" placeholder="Утас" value={form.phone} onChange={e=>setForm(s=>({...s,phone:e.target.value}))}/>
          <input type="date" className="rounded-xl border px-3 py-2.5" value={form.dateISO} onChange={e=>setForm(s=>({...s,dateISO:e.target.value}))}/>
          <input type="time" className="rounded-xl border px-3 py-2.5" value={form.time} onChange={e=>setForm(s=>({...s,time:e.target.value}))}/>
        </div>
        <div className="mt-3">
          <button
            className="btn-brand"
            onClick={()=>{
              if(!form.branchId || !form.serviceId || !form.dateISO || !form.time || !form.customerName) return;
              addBooking({
                ...form,
                price: priceFor(form.branchId, form.serviceId),
                status: "confirmed",
              });
              setForm({
                branchId: branches[0]?.id ?? "",
                serviceId: services[0]?.id ?? "",
                dateISO: "",
                time: "",
                customerName: "",
                phone: "",
              });
            }}
          >Нэмэх</button>
        </div>
      </div>

      <div className="card p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left text-gray-600">
            <th className="py-2 pr-4">Огноо</th><th className="py-2 pr-4">Цаг</th><th className="py-2 pr-4">Салбар</th>
            <th className="py-2 pr-4">Үйлчилгээ</th><th className="py-2 pr-4">Үйлчлүүлэгч</th>
            <th className="py-2 pr-4">Утас</th><th className="py-2 pr-4">Төлөв</th><th className="py-2 pr-4">Үнэ</th><th className="py-2 pr-4">Үйлдэл</th>
          </tr></thead>
          <tbody>
            {filtered.map(bk => {
              const b = branches.find(x=>x.id===bk.branchId)?.name ?? "—";
              const s = services.find(x=>x.id===bk.serviceId)?.title ?? "—";
              return (
                <tr key={bk.id} className="border-t">
                  <td className="py-2 pr-4 whitespace-nowrap">{bk.dateISO}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{bk.time}</td>
                  <td className="py-2 pr-4">{b}</td>
                  <td className="py-2 pr-4">{s}</td>
                  <td className="py-2 pr-4">{bk.customerName}</td>
                  <td className="py-2 pr-4">{bk.phone}</td>
                  <td className="py-2 pr-4">
                    <select className="border rounded px-2 py-1" value={bk.status} onChange={e=>updateBooking(bk.id,{status: e.target.value as any})}>
                      <option value="pending">Хүлээгдэж буй</option>
                      <option value="confirmed">Баталгаажсан</option>
                      <option value="cancelled">Цуцлагдсан</option>
                    </select>
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">{bk.price ? new Intl.NumberFormat("mn-MN").format(bk.price)+"₮" : "—"}</td>
                  <td className="py-2 pr-4">
                    <button className="btn-outline" onClick={()=>removeBooking(bk.id)}>Устгах</button>
                  </td>
                </tr>
              );
            })}
            {filtered.length===0 && (
              <tr><td colSpan={9} className="py-6 text-center text-gray-600">Мэдээлэл алга.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
