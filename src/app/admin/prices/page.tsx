"use client";
import { useMemo, useState } from "react";
import { useAdminStore } from "@/lib/admin.store";

export default function PricesPage() {
  const { branches, services, branchServices, setBranchService, removeBranchService } = useAdminStore();
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const rows = useMemo(() => {
    return services.map(s => {
      const rel = branchServices.find(bs => bs.branchId === branchId && bs.serviceId === s.id);
      return { service: s, rel };
    });
  }, [services, branchServices, branchId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Салбарын үйлчилгээ ба үнэ</h1>

      <div className="card p-4">
        <label className="text-sm font-medium">Салбар</label>
        <select className="mt-2 rounded-xl border px-3 py-2.5" value={branchId} onChange={(e)=>setBranchId(e.target.value)}>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="card p-4">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left text-gray-600">
            <th className="py-2 pr-4">Үйлчилгээ</th><th className="py-2 pr-4">Идэвхтэй</th><th className="py-2 pr-4">Үнэ (₮)</th><th className="py-2 pr-4">Үйлдэл</th>
          </tr></thead>
          <tbody>
            {rows.map(({ service, rel }) => (
              <tr key={service.id} className="border-t">
                <td className="py-2 pr-4">{service.title}</td>
                <td className="py-2 pr-4">
                  <input
                    type="checkbox"
                    checked={!!rel?.active}
                    onChange={e => setBranchService(branchId, service.id, rel?.price ?? 0, e.target.checked)}
                  />
                </td>
                <td className="py-2 pr-4">
                  <input
                    className="w-32 border rounded px-2 py-1"
                    type="number"
                    value={rel?.price ?? 0}
                    onChange={e => setBranchService(branchId, service.id, Number(e.target.value || 0), rel?.active ?? true)}
                  />
                </td>
                <td className="py-2 pr-4">
                  {rel ? (
                    <button className="btn-outline" onClick={() => removeBranchService(rel.id)}>Холболт устгах</button>
                  ) : (
                    <button className="btn-outline" onClick={() => setBranchService(branchId, service.id, 0, true)}>Нэмж идэвхжүүлэх</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
