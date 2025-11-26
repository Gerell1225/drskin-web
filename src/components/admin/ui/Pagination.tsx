"use client";

import { cls } from "../utils";

export function Pagination({ page, total, onPage }: { page: number; total: number; onPage: (page: number) => void }) {
  const pages = Math.max(total, 1);
  const numbers = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-end gap-2 text-sm">
      {numbers.map((n) => (
        <button
          key={n}
          onClick={() => onPage(n)}
          className={cls(
            "rounded-lg px-3 py-1",
            n === page ? "bg-brand text-white" : "border border-gray-200 bg-white hover:bg-gray-50",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
