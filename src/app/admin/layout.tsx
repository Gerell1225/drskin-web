export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-[240px_1fr]">
      <aside className="hidden md:block border-r p-4">
        <div className="font-semibold mb-4">Админ</div>
        <nav className="grid gap-2 text-sm">
          <a href="/admin" className="hover:text-brand">Хянах самбар</a>
          <a href="/admin/branches" className="hover:text-brand">Салбарууд</a>
          <a href="/admin/services" className="hover:text-brand">Үйлчилгээ</a>
          <a href="/admin/prices" className="hover:text-brand">Салбарын үнэ</a>
          <a href="/admin/bookings" className="hover:text-brand">Захиалгууд</a>
        </nav>
        <form action="/api/auth/logout" method="post" className="mt-6">
          <button className="btn-outline w-full">Гарах</button>
        </form>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}
