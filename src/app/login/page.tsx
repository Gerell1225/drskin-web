"use client";
import { useState } from "react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data?.error || "login_failed");
      window.location.assign(data.redirect || "/");
    } catch (e: any) {
      setErr(e.message || "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Нэвтрэх</h1>
        <p className="text-sm text-gray-600 mt-1">Утасны дугаар, нууц үг ашиглана.</p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-medium">Утас</label>
            <input
              className="mt-2 w-full rounded-xl border px-3 py-2.5"
              placeholder="9xxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Нууц үг</label>
            <input
              type="password"
              className="mt-2 w-full rounded-xl border px-3 py-2.5"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-brand disabled:opacity-60"
          >
            {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх"}
          </button>
          <a href="/register" className="text-sm text-center text-gray-700 hover:underline">
            Бүртгэлгүй юу? Бүртгүүлэх
          </a>
        </form>
      </div>
    </main>
  );
}
