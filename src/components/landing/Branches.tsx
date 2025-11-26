"use client";
import React, { useMemo, useState } from "react";

type Branch = {
  id: string;
  name: string;
  addr: string;
  phone: string;
  hours: string;
  mapUrl?: string;
};

export default function BranchesSection(props: { branches?: Branch[] }) {
  const BRANCHES: Branch[] =
    props.branches ?? [
      {
        id: "b1",
        name: "DrSkin — Gem Mall",
        addr: "УБ, Gem Mall, 2-р давхар",
        phone: "77030808",
        hours: "Өдөр бүр 10:00–20:00",
        mapUrl: "https://maps.google.com/?q=Gem+Mall+Ulaanbaatar",
      },
      {
        id: "b2",
        name: "DrSkin — Хүннү",
        addr: "УБ, Хүннү Молл",
        phone: "77030808",
        hours: "Өдөр бүр 10:00–20:00",
        mapUrl: "https://maps.google.com/?q=Hunnu+Mall+Ulaanbaatar",
      },
      {
        id: "b3",
        name: "DrHair — Центр",
        addr: "УБ, Төв гудамж",
        phone: "77030808",
        hours: "Өдөр бүр 10:00–20:00",
        mapUrl: "https://maps.google.com/?q=Ulaanbaatar+Center",
      },
    ];

  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return BRANCHES;
    return BRANCHES.filter(
      (b) =>
        b.name.toLowerCase().includes(t) ||
        b.addr.toLowerCase().includes(t) ||
        b.phone.toLowerCase().includes(t)
    );
  }, [q, BRANCHES]);

  return (
    <section id="branches" className="py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Салбарууд</h2>
            <p className="text-sm md:text-base text-gray-600 mt-2">
              Танд ойр салбарыг сонгон цаг авч үйлчлүүлээрэй.
            </p>
          </div>
          <div className="md:min-w-[320px]">
            <label className="text-sm font-medium">Хайлт</label>
            <input
              className="mt-2 w-full rounded-xl border px-3 py-2.5"
              placeholder="Нэр, хаяг, утас..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <article key={b.id} className="card p-5 card-hover">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{b.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{b.addr}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#D42121]/10 text-[#D42121] text-xs px-2 py-1">
                  Нээлттэй
                </span>
              </div>

              <div className="mt-4 space-y-1 text-sm">
                <p className="text-gray-700">
                  <span className="text-gray-500">Утас: </span>
                  <a className="hover:underline" href={`tel:${b.phone}`}>{b.phone}</a>
                </p>
                <p className="text-gray-700">
                  <span className="text-gray-500">Ажиллах цаг: </span>{b.hours}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <a
                  href={b.mapUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-2xl text-white text-sm ${b.mapUrl ? "" : "pointer-events-none opacity-50"}`}
                  style={{ background: "#D42121" }}
                >
                  Газрын зураг
                </a>
                <a href="#booking" className="btn-outline text-sm">
                  Цаг захиалах
                </a>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-gray-600 py-8">
              Илэрц олдсонгүй.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
