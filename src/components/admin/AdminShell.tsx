"use client";
import { useState } from "react";
import { useAdminStore } from "@/lib/admin.store";
import AdminCard from "@/components/admin/AdminCard";
import { Table, T, Th, Td } from "@/components/admin/Table";

export default function BranchesPage() {
  const { branches, addBranch, updateBranch, removeBranch } = useAdminStore();
  const [form, setForm] = useState({ name: "", addr: "", phone: "", hours: "", mapUrl: "" });

  return (
    <div className="grid gap-6">
      <AdminCard title="Шинэ салбар" desc="Нэр, хаяг, утас, ажиллах цаг, газрын зураг">
        <div className="grid md:grid-cols-2 gap-3">
          {["name","addr","phone","hours","mapUrl"].map((k) => (
            <input key={k} className="rounded-xl border px-3 py-2.5" placeholder={k}
              value={(form as any)[k]} onChange={(e)=>setForm(s=>({...s,[k]:e.target.value}))}/>
          ))}
        </div>
        <div className="mt-3">
          <button
            className="btn-brand"
            onClick={() => {
              if (!form.name) return;
              addBranch({ ...form, mapUrl: form.mapUrl || undefined });
              setForm({ name: "", addr: "", phone: "", hours: "", mapUrl: "" });
            }}
          >Нэмэх</button>
        </div>
      </AdminCard>

      <AdminCard title="Салбарууд">
        <Table>
          <T>
            <thead><tr>
              <Th>Нэр</Th><Th>Хаяг</Th><Th>Утас</Th><Th>Цаг</Th><Th>Map</Th><Th>Үйлдэл</Th>
            </tr></thead>
            <tbody>
              {branches.map((b)=>(
                <tr key={b.id} className="border-t">
                  <Td><input className="w-full border rounded px-2 py-1" value={b.name} onChange={e=>updateBranch(b.id,{name:e.target.value})}/></Td>
                  <Td><input className="w-full border rounded px-2 py-1" value={b.addr} onChange={e=>updateBranch(b.id,{addr:e.target.value})}/></Td>
                  <Td><input className="w-full border rounded px-2 py-1" value={b.phone} onChange={e=>updateBranch(b.id,{phone:e.target.value})}/></Td>
                  <Td><input className="w-full border rounded px-2 py-1" value={b.hours} onChange={e=>updateBranch(b.id,{hours:e.target.value})}/></Td>
                  <Td><input className="w-full border rounded px-2 py-1" value={b.mapUrl ?? ""} onChange={e=>updateBranch(b.id,{mapUrl:e.target.value || undefined})}/></Td>
                  <Td><button className="btn-outline" onClick={()=>removeBranch(b.id)}>Устгах</button></Td>
                </tr>
              ))}
            </tbody>
          </T>
        </Table>
      </AdminCard>
    </div>
  );
}
