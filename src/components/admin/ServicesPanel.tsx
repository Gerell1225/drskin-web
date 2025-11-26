"use client";

import { useMemo, useState } from "react";
import { serviceSchema } from "./utils";
import { repo } from "./repo";
import { Service } from "./types";
import { Modal } from "./ui/Modal";
import { Pagination } from "./ui/Pagination";
import { Toast } from "./ui/Toast";

const PAGE_SIZE = 6;

export function ServicesPanel() {
  const [items, setItems] = useState(repo.listServices());
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(items.length / PAGE_SIZE) || 1;
  const paged = useMemo(
    () => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [items, page],
  );

  const onSave = (formData: FormData) => {
    const parsed = serviceSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      setError(parsed.error.issues?.[0]?.message ?? "Алдаа гарлаа");
      return;
    }
    setError(null);
    repo.upsertService(parsed.data as Service);
    setItems(repo.listServices());
    setToast("Үйлчилгээг хадгаллаа");
    setModalOpen(false);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setModalOpen(true);
  };

  const openNew = () => {
    setEditing({
      id: crypto.randomUUID(),
      name: "",
      category: "",
      durationMin: 30,
      kind: "skin",
      description: "",
    });
    setModalOpen(true);
  };

  const onDelete = (id: string) => {
    repo.removeService(id);
    setItems(repo.listServices());
    setToast("Устгалаа");
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Үйлчилгээ</h2>
          <p className="text-sm text-gray-600">Ангилал, үргэлжлэх хугацаа, тайлбар.</p>
        </div>
        <button onClick={openNew} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm">
          + Үйлчилгээ
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Нэр</th>
              <th className="p-3">Ангилал</th>
              <th className="p-3">Төрөл</th>
              <th className="p-3">Минут</th>
              <th className="p-3">Тайлбар</th>
              <th className="p-3 text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3">{s.category}</td>
                <td className="p-3 capitalize">{s.kind}</td>
                <td className="p-3">{s.durationMin} мин</td>
                <td className="max-w-[200px] truncate p-3 text-gray-700">{s.description}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2 text-xs">
                    <button className="text-brand" onClick={() => openEdit(s)}>
                      Засах
                    </button>
                    <button className="text-red-600" onClick={() => onDelete(s.id)}>
                      Устгах
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={6}>
                  Үйлчилгээ алга
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <Pagination page={page} total={totalPages} onPage={setPage} />
      </div>

      <Modal open={modalOpen} title={editing ? "Засах" : "Шинээр нэмэх"} onClose={() => setModalOpen(false)}>
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <form className="grid gap-3" action={onSave}>
          <input type="hidden" name="id" defaultValue={editing?.id} />
          <label className="grid gap-1 text-sm">
            Нэр
            <input name="name" defaultValue={editing?.name} className="rounded-lg border p-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Ангилал
            <input name="category" defaultValue={editing?.category} className="rounded-lg border p-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Үргэлжлэх хугацаа (мин)
            <input name="durationMin" type="number" defaultValue={editing?.durationMin} className="rounded-lg border p-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Төрөл
            <select name="kind" defaultValue={editing?.kind} className="rounded-lg border p-2">
              <option value="skin">Арьс</option>
              <option value="hair">Үс</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Тайлбар
            <textarea name="description" defaultValue={editing?.description} className="rounded-lg border p-2" />
          </label>
          <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Хадгалах</button>
        </form>
      </Modal>
      <Toast message={toast} />
    </section>
  );
}
