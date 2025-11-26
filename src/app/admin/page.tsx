"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookingsPanel } from "@/components/admin/BookingsPanel";
import { BranchesPanel } from "@/components/admin/BranchesPanel";
import { CustomersPanel } from "@/components/admin/CustomersPanel";
import { PricingPanel } from "@/components/admin/PricingPanel";
import { ServicesPanel } from "@/components/admin/ServicesPanel";
import withAdmin from "@/components/admin/withAdmin";

const tabs = [
  { id: "branches", label: "Салбар", render: (query: string) => <BranchesPanel query={query} /> },
  { id: "services", label: "Үйлчилгээ", render: (query: string) => <ServicesPanel query={query} /> },
  { id: "pricing", label: "Үнийн хүснэгт", render: (query: string) => <PricingPanel query={query} /> },
  { id: "bookings", label: "Захиалга", render: (query: string) => <BookingsPanel query={query} /> },
  { id: "customers", label: "Үйлчлүүлэгч", render: (query: string) => <CustomersPanel query={query} /> },
];

function AdminPage() {
  const [active, setActive] = useState<string>("branches");
  const [search, setSearch] = useState("");

  const ActivePanel = useMemo(() => tabs.find((tab) => tab.id === active), [active]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white">Dr</div>
              <div>
                <p className="text-sm text-gray-600">DrSkin Admin</p>
                <h1 className="text-2xl font-semibold">Удирдах самбар</h1>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm sm:w-64"
                placeholder="Хайх..."
              />
              <div className="flex gap-2 text-sm">
                <Link href="/" className="rounded-xl border px-4 py-2">
                  Нүүр
                </Link>
                <Link href="/login" className="rounded-xl bg-brand px-4 py-2 font-semibold text-white">
                  Системээс гарах
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t pt-3 text-sm font-semibold text-gray-600">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`rounded-lg px-3 py-2 transition ${
                  active === tab.id ? "border-b-2 border-brand text-brand" : "text-gray-600 hover:text-brand"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {ActivePanel?.render(search)}
      </div>
    </main>
  );
}

export default withAdmin(AdminPage);
