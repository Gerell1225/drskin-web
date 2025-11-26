"use client";

import { useMemo, useState } from "react";
import { repo } from "./repo";
import { Customer } from "./types";
import { Modal } from "./ui/Modal";
import { Pagination } from "./ui/Pagination";
import { Toast } from "./ui/Toast";

const PAGE_SIZE = 6;

export function CustomersPanel() {
  const [items, setItems] = useState(repo.listCustomers());
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [toast, setToast] = useState("");

  const totalPages = Math.ceil(items.length / PAGE_SIZE) || 1;
  const paged = useMemo(
    () => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [items, page],
  );

  const openNew = () => {
    setEditing({ id: crypto.randomUUID(), name: "", phone: "", tier: "standard", points: 0 });
    setModalOpen(true);
  };

  const onSave = (formData: FormData) => {
    const payload = Object.fromEntries(formData.entries()) as unknown as Customer;
    payload.points = Number(payload.points ?? 0);
    repo.upsertCustomer(payload);
    setItems(repo.listCustomers());
    setToast("Хадгаллаа");
    setModalOpen(false);
  };

  const onDelete = (id: string) => {
    repo.removeCustomer(id);
    setItems(repo.listCustomers());
    setToast("Устгалаа");
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setModalOpen(true);
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Үйлчлүүлэгчид</h2>
          <p className="text-sm text-gray-600">Урамшуулал оноо, түвшин.</p>
        </div>
        <button onClick={openNew} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm">
          + Үйлчлүүлэгч
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Нэр</th>
              <th className="p-3">Утас</th>
              <th className="p-3">Түвшин</th>
              <th className="p-3">Оноо</th>
              <th className="p-3 text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3 capitalize">{c.tier}</td>
                <td className="p-3">{c.points}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2 text-xs">
                    <button className="text-brand" onClick={() => openEdit(c)}>
                      Засах
                    </button>
                    <button className="text-red-600" onClick={() => onDelete(c.id)}>
                      Устгах
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={5}>
                  Үйлчлүүлэгч алга
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <Pagination page={page} total={totalPages} onPage={setPage} />
      </div>

      <Modal open={modalOpen} title="Мэдээлэл" onClose={() => setModalOpen(false)}>
        <form className="grid gap-3" action={onSave}>
          <input type="hidden" name="id" defaultValue={editing?.id} />
          <label className="grid gap-1 text-sm">
            Нэр
            <input name="name" defaultValue={editing?.name} className="rounded-lg border p-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Утас
            <input name="phone" defaultValue={editing?.phone} className="rounded-lg border p-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Түвшин
            <select name="tier" defaultValue={editing?.tier} className="rounded-lg border p-2">
              <option value="standard">Standard</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Оноо
            <input name="points" type="number" defaultValue={editing?.points} className="rounded-lg border p-2" />
          </label>
          <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Хадгалах</button>
        </form>
      </Modal>

      <Toast message={toast} />
    </section>
  );
}
