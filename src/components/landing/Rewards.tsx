"use client";
import React from "react";
import { Gift, History as HistoryIcon, Star } from "lucide-react";

type HistoryRow = {
  id: string;
  dateISO: string;    // YYYY-MM-DD
  branch: string;     // display name
  service: string;    // display name
  price: number;      // in MNT
  points: number;
  status: "Баталгаажсан" | "Цуцлагдсан";
};

type UserSummary = {
  name: string;
  points: number;           // current balance
  tier: "Silver" | "Gold" | "Platinum";
  nextTierAt: number;       // points needed for next tier
};

function formatMNT(v: number) {
  return new Intl.NumberFormat("mn-MN").format(v) + "₮";
}

export default function Rewards(props: {
  loggedIn?: boolean;
  user?: UserSummary;
  history?: HistoryRow[];
}) {
  const loggedIn = props.loggedIn ?? true;
  const user: UserSummary = props.user ?? {
    name: "Зочин",
    points: 1250,
    tier: "Silver",
    nextTierAt: 3000,
  };

  const history: HistoryRow[] =
    props.history ?? [
      { id: "h1", dateISO: "2025-10-01", branch: "Gem Mall", service: "Нүүр будалтын цэвэрлэгээ", price: 59000, points: 59, status: "Баталгаажсан" },
      { id: "h2", dateISO: "2025-10-18", branch: "Хүннү", service: "Гүн цэвэрлэгээ (Ultra Peel)", price: 92000, points: 92, status: "Баталгаажсан" },
      { id: "h3", dateISO: "2025-11-04", branch: "Центр", service: "Үсний SPA", price: 79000, points: 79, status: "Баталгаажсан" },
    ];

  const progress = Math.min(100, Math.round((user.points / user.nextTierAt) * 100));

  return (
    <section id="rewards" className="py-16 md:py-24 bg-[#F7F7F7]">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
              <Gift className="h-6 w-6 text-[#D42121]" /> Урамшууллын оноо
            </h2>
            <p className="text-sm md:text-base text-gray-600 mt-2">
              Захиалга бүрээс оноо цуглуулж хөнгөлөлт, бэлэг авах боломжтой.
            </p>
          </div>
          {!loggedIn && (
            <a href="/login" className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm">
              Нэвтэрч оноогоо шалгах
            </a>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white border p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">Таны үлдэгдэл</p>
              <Star className="h-5 w-5 text-[#D42121]" />
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {loggedIn ? new Intl.NumberFormat("mn-MN").format(user.points) : "—"}{" "}
              <span className="text-base font-normal">оноо</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Таны зэрэг: <span className="font-medium">{loggedIn ? user.tier : "—"}</span>
            </p>
            <div className="mt-4">
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-[#D42121]" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Дараагийн зэрэгт:{" "}
                <span className="font-medium">
                  {loggedIn ? Math.max(0, user.nextTierAt - user.points) : "—"}
                </span>{" "}
                оноо дутуу
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border p-5 shadow-sm">
            <p className="font-medium">Оноо цуглуулах</p>
            <ul className="mt-3 text-sm text-gray-700 space-y-2 list-disc list-inside">
              <li>
                Төлсөн дүн тутамд <span className="font-medium">10,000₮ = 1 оноо</span>
              </li>
              <li>Зэрэг ахих бүрд илүү их урамшуулал</li>
              <li>
                Оноогоо <span className="font-medium">хөнгөлөлт</span> эсвэл{" "}
                <span className="font-medium">бэлэг</span> болгон ашиглаарай
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white border p-5 shadow-sm">
            <p className="font-medium">Давуу тал</p>
            <ul className="mt-3 text-sm text-gray-700 space-y-2 list-disc list-inside">
              <li>Silver: төрсөн өдрийн 5% хөнгөлөлт</li>
              <li>Gold: улирлын 10% купон</li>
              <li>Platinum: VIP урьдчилсан захиалга</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <HistoryIcon className="h-5 w-5" />
            <p className="font-medium">Сүүлийн захиалгууд</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-4">Огноо</th>
                  <th className="py-2 pr-4">Салбар</th>
                  <th className="py-2 pr-4">Үйлчилгээ</th>
                  <th className="py-2 pr-4">Төлбөр</th>
                  <th className="py-2 pr-4">Оноо</th>
                  <th className="py-2 pr-4">Төлөв</th>
                </tr>
              </thead>
              <tbody>
                {loggedIn ? (
                  history.map((h) => (
                    <tr key={h.id} className="border-t">
                      <td className="py-3 pr-4 whitespace-nowrap">{h.dateISO}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{h.branch}</td>
                      <td className="py-3 pr-4">{h.service}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{formatMNT(h.price)}</td>
                      <td className="py-3 pr-4 whitespace-nowrap font-medium">+{h.points}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            h.status === "Баталгаажсан"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-600">
                      Оноо, түүх харахын тулд нэвтэрч орно уу.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
