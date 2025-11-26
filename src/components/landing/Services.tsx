const services = [
  { title: "Hydrafacial", desc: "Арьсыг гүн цэвэрлэж, чийгшүүлнэ", duration: "60 мин" },
  { title: "Laser hair therapy", desc: "Үсний уналтыг бууруулна", duration: "45 мин" },
  { title: "Microneedling", desc: "Сорви, нүхжилтийг багасгана", duration: "50 мин" },
  { title: "Scalp detox", desc: "Тос, бохирдлыг арилгана", duration: "40 мин" },
];

export default function Services() {
  return (
    <section id="services" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand">Үйлчилгээ</p>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Арьс, үсэнд тохирсон багц</h2>
            <p className="text-gray-600">Таны асуудалд тулгуурласан шийдлийг эмч нар санал болгож байна.</p>
          </div>
          <a href="#hero" className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Цаг захиалах
          </a>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div key={service.title} className="rounded-2xl border bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">{service.desc}</p>
              <p className="mt-3 text-xs font-semibold text-brand">{service.duration}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
