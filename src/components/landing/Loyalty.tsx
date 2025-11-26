export default function Loyalty() {
  return (
    <section id="loyalty" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 rounded-2xl border bg-gradient-to-r from-rose-50 to-white p-6 shadow-sm sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-brand">Урамшуулал</p>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">1 оноо = 1₮</h2>
            <p className="mt-2 text-gray-700">10,000₮ тутамд 1 оноо цуглуулж, дараагийн төлбөрт шууд ашиглаарай.</p>
          </div>
          <ul className="grid gap-2 text-sm text-gray-700">
            <li>• Автомат хуримтлал — төлбөр бүрээс оноо.</li>
            <li>• Ятгах хэрэггүй — оноо шууд хасагдана.</li>
            <li>• Гишүүнчлэлийн түвшин: Standard, Silver, Gold.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
