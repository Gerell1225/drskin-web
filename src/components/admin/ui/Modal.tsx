"use client";

import { ReactNode } from "react";
import { cls } from "../utils";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  actions?: ReactNode;
};

export function Modal({ open, title, children, onClose, actions }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="Close">
            ×
          </button>
        </div>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto px-4 py-3">{children}</div>
        <div className={cls("sticky bottom-0 flex flex-wrap items-center justify-end gap-3 border-t bg-white px-4 py-3")}> 
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Хаах
          </button>
          {actions}
        </div>
      </div>
    </div>
  );
}
