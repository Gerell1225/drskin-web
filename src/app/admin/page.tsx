"use client";
import KpiCard from "@/components/admin/KpiCard";
import AdminCard from "@/components/admin/AdminCard";
import { Table, T, Th, Td } from "@/components/admin/Table";
import { useAdminStore } from "@/lib/admin.store";

export default function AdminHome() {
  const { branches, services, branchServices, bookings } = useAdminStore();

  const totalActiveRelations = branchServices.filter(b => b.active).length;
  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter(b => b.dateISO === today).length;

  const recent = [...bookings]
    .sort((a, b) => (a.dateISO + a.time).localeCompare(b.dateISO + b.time))
    .slice(-5)
    .reverse();

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Нийт салбар" value={String(branches.length)} />
        <KpiCard label="Үйлчилгээ" value={String(services.length)} />
        <KpiCard label="Идэвхтэй холболт" value={String(totalActiveRelations)} sub="Салбар × үйлчилгээ" />
        <KpiCard label="Өнөөдрийн захиалга" value={String(todayBookings)} />
      </div>

      <AdminCard title="Сүүлийн захиалгууд" desc="Шинэ 5 бичлэг">
        <div className="hidden md:block">
          <Table>
            <T>
              <thead>
                <tr>
                  <Th>Огноо</Th><Th>Цаг</Th><Th>Салбар</Th><Th>Үйлчилгээ</Th><Th>Нэр</Th><Th>Утас</Th><Th>Төлөв</Th>
                </tr>
              </thead>
              <tbody>
                {recent.map((bk) => {
                  const b = branches.find(x=>x.id===bk.branchId)?.name ?? "—";
                  const s = services.find(x=>x.id===bk.serviceId)?.title ?? "—";
                  return (
                    <tr key={bk.id} className="border-t">
                      <Td>{bk.dateISO}</Td>
                      <Td>{bk.time}</Td>
                      <Td>{b}</Td>
                      <Td>{s}</Td>
                      <Td>{bk.customerName}</Td>
                      <Td>{bk.phone}</Td>
                      <Td>
                        <span className={`px-2 py-1 rounded-full text-xs ${bk.status==="confirmed"?"bg-green-50 text-green-700":bk.status==="pending"?"bg-yellow-50 text-yellow-700":"bg-red-50 text-red-700"}`}>
                          {bk.status}
                        </span>
                      </Td>
                    </tr>
                  );
                })}
                {recent.length===0 && (
                  <tr><td colSpan={7}>Мэдээлэл алга.</td></tr>
                )}
              </tbody>
            </T>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="grid md:hidden gap-3">
          {recent.map(bk=>{
            const b = branches.find(x=>x.id===bk.branchId)?.name ?? "—";
            const s = services.find(x=>x.id===bk.serviceId)?.title ?? "—";
            return (
              <div key={bk.id} className="rounded-2xl border bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{bk.dateISO} • {bk.time}</div>
                  <span className={`px-2 py-1 rounded-full text-xs ${bk.status==="confirmed"?"bg-green-50 text-green-700":bk.status==="pending"?"bg-yellow-50 text-yellow-700":"bg-red-50 text-red-700"}`}>
                    {bk.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-700">{b}</div>
                <div className="text-sm text-gray-700">{s}</div>
                <div className="mt-1 text-xs text-gray-600">{bk.customerName} • {bk.phone}</div>
              </div>
            );
          })}
          {recent.length===0 && (
            <div className="text-center text-gray-600 py-6">Мэдээлэл алга.</div>
          )}
        </div>
      </AdminCard>

      <AdminCard title="Түргэн холбоос">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <a href="/admin/branches" className="card p-4 card-hover">
            <p className="font-medium">Салбар нэмэх</p>
            <p className="text-sm text-gray-600">Газрын зурагтай.</p>
          </a>
          <a href="/admin/services" className="card p-4 card-hover">
            <p className="font-medium">Үйлчилгээ нэмэх</p>
            <p className="text-sm text-gray-600">Тайлбар, хугацаа.</p>
          </a>
          <a href="/admin/prices" className="card p-4 card-hover">
            <p className="font-medium">Салбарын үнэ</p>
            <p className="text-sm text-gray-600">Идэвхжүүлэх/үнэ тогтоох.</p>
          </a>
          <a href="/admin/bookings" className="card p-4 card-hover">
            <p className="font-medium">Захиалгууд</p>
            <p className="text-sm text-gray-600">Шүүлтүүртэй харах.</p>
          </a>
        </div>
      </AdminCard>
    </div>
  );
}
