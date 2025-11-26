import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().min(4, "И-мэйл эсвэл утас оруулна уу"),
  password: z.string().min(4, "Нууц үгээ оруулна уу"),
});

async function login(formData: FormData) {
  "use server";
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }
  const { identifier } = parsed.data;
  const role = identifier.includes("admin") ? "admin" : "customer";
  cookies().set("role", role, { httpOnly: false, path: "/" });
  if (role === "admin") {
    redirect("/admin");
  }
  redirect("/");
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Нэвтрэх</h1>
        <p className="mt-1 text-sm text-gray-600">Утас эсвэл и-мэйл, нууц үгээ ашиглана.</p>
        <form action={login} className="mt-6 grid gap-4">
          <label className="grid gap-1 text-sm">
            И-мэйл эсвэл утас
            <input name="identifier" className="rounded-xl border px-3 py-2.5" placeholder="you@example.mn" />
          </label>
          <label className="grid gap-1 text-sm">
            Нууц үг
            <input name="password" type="password" className="rounded-xl border px-3 py-2.5" placeholder="••••••••" />
          </label>
          <button type="submit" className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white">
            Нэвтрэх
          </button>
          <a href="/register" className="text-center text-sm text-gray-700 hover:underline">
            Бүртгэлгүй юу? Бүртгүүлэх
          </a>
        </form>
      </div>
    </main>
  );
}
