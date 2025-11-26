"use client";

import { useMemo, useState } from "react";
import { priceSchema } from "./utils";
import { repo } from "./repo";
import { BranchService } from "./types";
import { Modal } from "./ui/Modal";
import { Pagination } from "./ui/Pagination";
import { Toast } from "./ui/Toast";
import { formatMoney } from "./utils";

const PAGE_SIZE = 8;

export function PricingPanel() {
  const [prices, setPrices] = useState(repo.listPrices());
  const [branches] = useState(repo.listBranches());
  const [services] = useState(repo.listServices());
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BranchService | null>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(prices.length / PAGE_SIZE) || 1;
  const paged = useMemo(
    () => prices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [prices, page],
  );

  const onSave = (formData: FormData) => {
    const parsed = priceSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Алдаа гарлаа");
      return;
    }
    setError(null);
    repo.upsertPrice(parsed.data as BranchService);
    setPrices(repo.listPrices());
    setToast("Хадгаллаа");
    setModalOpen(false);
  };

  const openNew = () => {
    setEditing({ branchId: branches[0]?.id ?? "", serviceId: services[0]?.id ?? "", price: 0 });
    setModalOpen(true);
  };

  const openEdit = (price: BranchService) => {
    setEditing(price);
    setModalOpen(true);
  };

  const onDelete = (branchId: string, serviceId: string) => {
    repo.removePrice(branchId, serviceId);
    setPrices(repo.listPrices());
    setToast("Устгалаа");
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Үнийн хүснэгт</h2>
          <p className="text-sm text-gray-600">Салбар × үйлчилгээ үнэ.</p>
        </div>
        <button onClick={openNew} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm">
          + Үнэ
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Салбар</th>
              <th className="p-3">Үйлчилгээ</th>
              <th className="p-3">Үнэ</th>
              <th className="p-3 text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((p) => {
              const branch = branches.find((b) => b.id === p.branchId)?.title ?? "—";
              const service = services.find((s) => s.id === p.serviceId)?.name ?? "—";
              return (
                <tr key={`${p.branchId}-${p.serviceId}`} className="border-t">
                  <td className="p-3">{branch}</td>
                  <td className="max-w-[200px] truncate p-3">{service}</td>
                  <td className="p-3 font-medium">{formatMoney(p.price)}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2 text-xs">
                      <button className="text-brand" onClick={() => openEdit(p)}>
                        Засах
                      </button>
                      <button className="text-red-600" onClick={() => onDelete(p.branchId, p.serviceId)}>
                        Устгах
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={4}>
                  Үнэ тохируулаагүй
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <Pagination page={page} total={totalPages} onPage={setPage} />
      </div>

      <Modal open={modalOpen} title={editing ? "Үнэлгээ" : "Үнэ нэмэх"} onClose={() => setModalOpen(false)}>
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <form className="grid gap-3" action={onSave}>
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
            Үнэ (₮)
            <input name="price" type="number" defaultValue={editing?.price} className="rounded-lg border p-2" />
          </label>
          <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Хадгалах</button>
        </form>
      </Modal>
      <Toast message={toast} />
    </section>
  );
}
