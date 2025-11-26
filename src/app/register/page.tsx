import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Нэрээ оруулна уу"),
  identifier: z.string().min(4, "Утас эсвэл и-мэйл"),
  password: z.string().min(4, "Нууц үгээ оруулна уу"),
});

async function register(formData: FormData): Promise<void> {
  "use server";
  const parsed = registerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message);
  }
  ( await cookies() ).set("role", "customer", { path: "/", httpOnly: false });
  redirect("/");
}

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Бүртгүүлэх</h1>
        <p className="mt-1 text-sm text-gray-600">Дараа нь Supabase-р нэвтрэх боломжтой.</p>
        <form action={register} className="mt-6 grid gap-4">
          <label className="grid gap-1 text-sm">
            Нэр
            <input name="name" className="rounded-xl border px-3 py-2.5" />
          </label>
          <label className="grid gap-1 text-sm">
            Утас эсвэл и-мэйл
            <input name="identifier" className="rounded-xl border px-3 py-2.5" />
          </label>
          <label className="grid gap-1 text-sm">
            Нууц үг
            <input name="password" type="password" className="rounded-xl border px-3 py-2.5" />
          </label>
          <button type="submit" className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white">
            Бүртгүүлэх
          </button>
          <a href="/login" className="text-center text-sm text-gray-700 hover:underline">
            Бүртгэлтэй бол нэвтрэх
          </a>
        </form>
      </div>
    </main>
  );
}
