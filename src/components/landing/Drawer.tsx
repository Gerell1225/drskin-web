"use client";

import { cls } from "../admin/utils";

type Props = { open: boolean; onClose: () => void; links: { href: string; label: string }[] };

export default function Drawer({ open, onClose, links }: Props) {
  return (
    <div className={cls("fixed inset-0 z-50 transition", open ? "pointer-events-auto" : "pointer-events-none")}> 
      <div className={cls("absolute inset-0 bg-black/30", open ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <div
        className={cls(
          "absolute right-0 top-0 h-full w-72 bg-white shadow-xl transition-transform",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold text-brand">DrSkin</span>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            ×
          </button>
        </div>
        <nav className="grid gap-2 px-4 text-sm font-medium">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={onClose} className="rounded-lg px-3 py-2 hover:bg-gray-50">
              {link.label}
            </a>
          ))}
          <a href="/login" className="rounded-lg px-3 py-2 hover:bg-gray-50" onClick={onClose}>
            Нэвтрэх
          </a>
          <a href="/register" className="rounded-lg px-3 py-2 hover:bg-gray-50" onClick={onClose}>
            Бүртгүүлэх
          </a>
        </nav>
        <div className="sticky bottom-0 mt-auto border-t bg-white px-4 py-4">
          <a
            href="#hero"
            onClick={onClose}
            className="block rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white shadow-sm"
          >
            Одоо цаг авах
          </a>
        </div>
      </div>
    </div>
  );
}
