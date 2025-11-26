"use client";
import { useState } from "react";
import { useAdminStore } from "@/lib/admin.store";

export default function ServicesPage() {
  const { services, addService, updateService, removeService } = useAdminStore();
  const [form, setForm] = useState({ title: "", duration: "", description: "" });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Үйлчилгээ</h1>

      <div className="card p-4">
        <p className="font-medium">Шинэ үйлчилгээ</p>
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          <input className="rounded-xl border px-3 py-2.5" placeholder="Нэр" value={form.title} onChange={(e)=>setForm(s=>({...s,title:e.target.value}))}/>
          <input className="rounded-xl border px-3 py-2.5" placeholder="Үргэлжлэх хугацаа" value={form.duration} onChange={(e)=>setForm(s=>({...s,duration:e.target.value}))}/>
          <input className="rounded-xl border px-3 py-2.5 md:col-span-3" placeholder="Тайлбар" value={form.description} onChange={(e)=>setForm(s=>({...s,description:e.target.value}))}/>
        </div>
        <div className="mt-3">
          <button
            className="btn-brand"
            onClick={() => {
              if (!form.title) return;
              addService({ ...form, description: form.description || undefined, duration: form.duration || undefined });
              setForm({ title: "", duration: "", description: "" });
            }}
          >Нэмэх</button>
        </div>
      </div>

      <div className="card p-4">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left text-gray-600">
            <th className="py-2 pr-4">Нэр</th><th className="py-2 pr-4">Хугацаа</th><th className="py-2 pr-4">Тайлбар</th><th className="py-2 pr-4">Үйлдэл</th>
          </tr></thead>
          <tbody>
            {services.map((s)=>(
              <tr key={s.id} className="border-t">
                <td className="py-2 pr-4"><input className="w-full border rounded px-2 py-1" value={s.title} onChange={e=>updateService(s.id,{title:e.target.value})}/></td>
                <td className="py-2 pr-4"><input className="w-full border rounded px-2 py-1" value={s.duration ?? ""} onChange={e=>updateService(s.id,{duration:e.target.value || undefined})}/></td>
                <td className="py-2 pr-4"><input className="w-full border rounded px-2 py-1" value={s.description ?? ""} onChange={e=>updateService(s.id,{description:e.target.value || undefined})}/></td>
                <td className="py-2 pr-4"><button className="btn-outline" onClick={()=>removeService(s.id)}>Устгах</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
