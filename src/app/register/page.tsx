export default function RegisterPage() {
  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Бүртгүүлэх</h1>
        <p className="text-sm text-gray-600 mt-1">Одоогоор демо — удахгүй Supabase-тэй холбоно.</p>
        <div className="mt-6 text-sm text-gray-700">
          Түр нэвтрэх хэсгээр орж болно: <a className="text-brand underline" href="/login">Нэвтрэх</a>
        </div>
      </div>
    </main>
  );
}
