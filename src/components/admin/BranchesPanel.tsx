"use client";

import { useMemo, useState } from "react";
import { Branch } from "./types";
import { branchSchema } from "./utils";
import { repo } from "./repo";
import { Modal } from "./ui/Modal";
import { Pagination } from "./ui/Pagination";
import { Toast } from "./ui/Toast";

const PAGE_SIZE = 5;

type Props = {
  query: string;
};

export function BranchesPanel({ query }: Props) {
  const [items, setItems] = useState(repo.branches.list());
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [toast, setToast] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter((item) =>
      [item.title, item.address, item.phone, item.hours].some((field) => field.toLowerCase().includes(q)),
    );
  }, [items, query]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const onSave = (formData: FormData) => {
    const parsed = branchSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setErrors(issue?.path?.[0] ? { [String(issue.path[0])]: issue.message } : { form: issue?.message ?? "Алдаа" });
      return;
    }
    setErrors({});
    repo.branches.upsert(parsed.data as Branch);
    setItems(repo.branches.list());
    setToast("Амжилттай хадгаллаа");
    setModalOpen(false);
  };

  const onDelete = (id: string) => {
    repo.branches.remove(id);
    setItems(repo.branches.list());
    setToast("Устгалаа");
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setModalOpen(true);
  };

  const openNew = () => {
    setEditing({
      id: crypto.randomUUID(),
      title: "",
      address: "",
      phone: "",
      hours: "",
      bedsSkin: 0,
      bedsHair: 0,
      mapUrl: "",
    });
    setModalOpen(true);
  };

  const formId = "branch-form";

  return (
    <section className="card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Салбарууд</h2>
          <p className="text-sm text-gray-600">Ор, цагийн хуваарь, холбоо барих.</p>
        </div>
        <button onClick={openNew} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm">
          + Нэмэх
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-[760px] text-sm">
          <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Нэр</th>
              <th className="p-3">Ор (арьс)</th>
              <th className="p-3">Ор (үс)</th>
              <th className="p-3">Цаг</th>
              <th className="p-3">Хаяг</th>
              <th className="p-3">Утас</th>
              <th className="p-3 text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="truncate p-3 font-medium">{b.title}</td>
                <td className="p-3">{b.bedsSkin}</td>
                <td className="p-3">{b.bedsHair}</td>
                <td className="p-3">{b.hours}</td>
                <td className="max-w-[220px] truncate p-3 text-gray-700">{b.address}</td>
                <td className="p-3">{b.phone}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2 text-xs">
                    <button className="text-brand" onClick={() => openEdit(b)}>
                      Засах
                    </button>
                    <button className="text-red-600" onClick={() => onDelete(b.id)}>
                      Устгах
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={7}>
                  Мэдээлэл алга
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
        title={editing ? "Салбар засах" : "Салбар нэмэх"}
        onClose={() => setModalOpen(false)}
        actions={
          <button form={formId} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Хадгалах
          </button>
        }
      >
        <form className="grid gap-3" action={onSave} id={formId}>
          <input type="hidden" name="id" defaultValue={editing?.id} />
          <label className="grid gap-1 text-sm">
            Нэр
            <input name="title" defaultValue={editing?.title} className="rounded-lg border p-2" />
            {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
          </label>
          <label className="grid gap-1 text-sm">
            Хаяг
            <input name="address" defaultValue={editing?.address} className="rounded-lg border p-2" />
            {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
          </label>
          <label className="grid gap-1 text-sm">
            Утас
            <input name="phone" defaultValue={editing?.phone} className="rounded-lg border p-2" />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
          </label>
          <label className="grid gap-1 text-sm">
            Цагийн хуваарь
            <input name="hours" defaultValue={editing?.hours} className="rounded-lg border p-2" />
            {errors.hours && <p className="text-xs text-red-600">{errors.hours}</p>}
          </label>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="grid gap-1">
              Арьсны ор
              <input name="bedsSkin" type="number" defaultValue={editing?.bedsSkin} className="rounded-lg border p-2" />
              {errors.bedsSkin && <p className="text-xs text-red-600">{errors.bedsSkin}</p>}
            </label>
            <label className="grid gap-1">
              Үсний ор
              <input name="bedsHair" type="number" defaultValue={editing?.bedsHair} className="rounded-lg border p-2" />
              {errors.bedsHair && <p className="text-xs text-red-600">{errors.bedsHair}</p>}
            </label>
          </div>
          <label className="grid gap-1 text-sm">
            Газрын зураг холбоос
            <input name="mapUrl" defaultValue={editing?.mapUrl} className="rounded-lg border p-2" />
            {errors.mapUrl && <p className="text-xs text-red-600">{errors.mapUrl}</p>}
          </label>
        </form>
      </Modal>

      <Toast message={toast} />
    </section>
  );
}
