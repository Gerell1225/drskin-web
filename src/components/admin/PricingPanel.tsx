"use client";

import { useMemo, useState } from "react";
import { priceSchema, formatMoney } from "./utils";
import { repo } from "./repo";
import { BranchService } from "./types";
import { Modal } from "./ui/Modal";
import { Pagination } from "./ui/Pagination";
import { Toast } from "./ui/Toast";

const PAGE_SIZE = 8;

type Props = {
  query: string;
};

export function PricingPanel({ query }: Props) {
  const [prices, setPrices] = useState(repo.pricing.list());
  const [branches] = useState(repo.branches.list());
  const [services] = useState(repo.services.list());
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BranchService | null>(null);
  const [toast, setToast] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return prices;
    return prices.filter((p) => {
      const branch = branches.find((b) => b.id === p.branchId)?.title ?? "";
      const service = services.find((s) => s.id === p.serviceId)?.name ?? "";
      return branch.toLowerCase().includes(q) || service.toLowerCase().includes(q);
    });
  }, [branches, prices, query, services]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const onSave = (formData: FormData) => {
    const parsed = priceSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setErrors(issue?.path?.[0] ? { [String(issue.path[0])]: issue.message } : { form: issue?.message ?? "Алдаа" });
      return;
    }
    setErrors({});
    repo.pricing.upsert(parsed.data as BranchService);
    setPrices(repo.pricing.list());
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
    repo.pricing.remove(branchId, serviceId);
    setPrices(repo.pricing.list());
    setToast("Устгалаа");
  };

  const formId = "pricing-form";

  return (
    <section className="card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Үнийн хүснэгт</h2>
          <p className="text-sm text-gray-600">Салбар × үйлчилгээ үнэ.</p>
        </div>
        <button onClick={openNew} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm">
          + Үнэ
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-[720px] text-sm">
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
                  <td className="max-w-[220px] truncate p-3">{service}</td>
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

      <Modal
        open={modalOpen}
        title={editing ? "Үнэлгээ" : "Үнэ нэмэх"}
        onClose={() => setModalOpen(false)}
        actions={
          <button form={formId} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Хадгалах
          </button>
        }
      >
        <form className="grid gap-3" action={onSave} id={formId}>
          <label className="grid gap-1 text-sm">
            Салбар
            <select name="branchId" defaultValue={editing?.branchId} className="rounded-lg border p-2">
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
            {errors.branchId && <p className="text-xs text-red-600">{errors.branchId}</p>}
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
            {errors.serviceId && <p className="text-xs text-red-600">{errors.serviceId}</p>}
          </label>
          <label className="grid gap-1 text-sm">
            Үнэ (₮)
            <input name="price" type="number" defaultValue={editing?.price} className="rounded-lg border p-2" />
            {errors.price && <p className="text-xs text-red-600">{errors.price}</p>}
          </label>
        </form>
      </Modal>
      <Toast message={toast} />
    </section>
  );
}
