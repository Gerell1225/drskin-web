"use client";
import { useEffect, useState } from "react";
import { Menu, X, LogIn, UserPlus, Star } from "lucide-react";
import { PRIMARY } from "./utils";

export function HeaderDesktop() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    setRole(document.cookie.match(/(?:^| )drskin_role=([^;]+)/)?.[1] ?? null);
  }, []);
  return (
    <header className="hidden md:block sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/65">
      <div className="mx-auto max-w-[1200px] px-6 py-3 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl" style={{ background: PRIMARY }} />
          <span className="text-xl font-semibold tracking-tight group-hover:opacity-90">DrSkin & DrHair</span>
        </a>
        <nav className="hidden lg:flex items-center gap-6 text-[15px]">
          {[
            { href: "#home", label: "Нүүр" },
            { href: "#services", label: "Үйлчилгээ" },
            { href: "#branches", label: "Салбарууд" },
            { href: "#rewards", label: "Оноо" },
            { href: "#contact", label: "Холбоо барих" },
          ].map((l) => (
            <a key={l.href} className="hover:text-[#D42121]" href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {role && role !== "admin" && (
            <a href="#rewards" className="hidden lg:inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm">
              <Star className="h-4 w-4 text-[#D42121]" /> Оноо
            </a>
          )}
          {role === "admin" ? (
            <a href="/admin" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-white" style={{ background: PRIMARY }}>
              Админ
            </a>
          ) : (
            <>
              <a href="/login" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm">
                <LogIn className="h-4 w-4" /> Нэвтрэх
              </a>
              <a href="/register" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm">
                <UserPlus className="h-4 w-4" /> Бүртгүүлэх
              </a>
            </>
          )}
          <a
            href="#booking"
            className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-white text-sm font-medium shadow-sm"
            style={{ background: PRIMARY }}
          >
            Онлайн захиалга
          </a>
        </div>
      </div>
    </header>
  );
}

export function HeaderMobile() {
  const [open, setOpen] = useState(false);
  return (
    <header className="md:hidden sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="px-4 py-3 flex items-center justify-between">
        <button aria-label="Open menu" onClick={() => setOpen(true)} className="p-2 rounded-xl border">
          <Menu className="h-5 w-5" />
        </button>
        <a href="#home" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl" style={{ background: PRIMARY }} />
          <span className="font-semibold">DrSkin & DrHair</span>
        </a>
        <div className="flex items-center gap-2">
          <a href="/login" aria-label="Login" className="p-2 rounded-xl border">
            <LogIn className="h-5 w-5" />
          </a>
          <a href="/register" aria-label="Register" className="p-2 rounded-xl border">
            <UserPlus className="h-5 w-5" />
          </a>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-[320px] bg-white shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl" style={{ background: PRIMARY }} />
                <span className="font-semibold">Цэс</span>
              </div>
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-2 rounded-xl border">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col text-[15px]">
              {[
                { href: "#home", label: "Нүүр" },
                { href: "#services", label: "Үйлчилгээ" },
                { href: "#branches", label: "Салбарууд" },
                { href: "#rewards", label: "Оноо" },
                { href: "#contact", label: "Холбоо барих" },
                { href: "#booking", label: "Захиалга" },
              ].map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="px-2 py-3 rounded-lg hover:bg-gray-50">
                  {l.label}
                </a>
              ))}
            </nav>
            <a
              href="#booking"
              onClick={() => setOpen(false)}
              className="mt-auto inline-flex items-center justify-center w-full px-4 py-2 rounded-xl text-white"
              style={{ background: PRIMARY }}
            >
              Онлайн захиалга
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
