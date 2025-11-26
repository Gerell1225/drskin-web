"use client";

import { useState } from "react";
import Drawer from "./Drawer";

const links = [
  { href: "#services", label: "Үйлчилгээ" },
  { href: "#branches", label: "Салбар" },
  { href: "#how", label: "Захиалах" },
  { href: "#loyalty", label: "Урамшуулал" },
  { href: "#faq", label: "Асуулт" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-white/80 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#hero" className="text-lg font-bold text-brand">
          DrSkin & DrHair
        </a>
        <nav className="hidden items-center gap-4 text-sm font-medium sm:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-gray-700 hover:text-brand">
              {link.label}
            </a>
          ))}
          <a href="/login" className="rounded-xl border px-4 py-2">Нэвтрэх</a>
          <a href="/register" className="rounded-xl bg-brand px-4 py-2 text-white">Бүртгүүлэх</a>
        </nav>
        <button className="rounded-xl border px-3 py-2 text-sm sm:hidden" onClick={() => setOpen(true)}>
          Цэс
        </button>
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} links={links} />
    </header>
  );
}
