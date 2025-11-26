"use client";

import { ReactNode } from "react";
import { cls } from "../utils";

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="Close">
            ×
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-4 py-3 space-y-3">{children}</div>
        <div className={cls("sticky bottom-0 flex justify-end gap-3 border-t bg-white px-4 py-3")}> 
          <button
            onClick={onClose}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
}
