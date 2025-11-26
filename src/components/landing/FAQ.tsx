const faqs = [
  { q: "Цуцлах нөхцөл?", a: "6 цагаас өмнө цуцалбал төлбөргүй. Найзуудын захиалгад зөвхөн цуцлагдсан суудлыг буцаана." },
  { q: "Оноогоо яаж ашиглах вэ?", a: "Төлбөр тооцооны үед автоматаар 1 оноо = 1₮ байдлаар хасагдана." },
  { q: "Ямар төлбөрийн хэрэгсэл?", a: "QPay-гаар төлөх боломжтой — одоогоор туршилтын төлөвтэй." },
];

export default function FAQ() {
  return (
    <section id="faq" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Түгээмэл асуулт</h2>
        <div className="mt-6 grid gap-3">
          {faqs.map((item) => (
            <div key={item.q} className="rounded-2xl border bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">{item.q}</h3>
              <p className="mt-1 text-sm text-gray-700">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
