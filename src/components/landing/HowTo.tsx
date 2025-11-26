const steps = [
  { title: "Үйлчилгээгээ сонго", desc: "Арьс эсвэл үсний үйлчилгээ, салбараа шийдэх." },
  { title: "Цаг товло", desc: "Танд тохирсон өдөр, цаг болон хүний тоог баталгаажуулна." },
  { title: "Төлбөр, урамшуулал", desc: "Баталгаажсаны дараа урамшууллын оноо автоматаар нэмэгдэнэ." },
];

export default function HowTo() {
  return (
    <section id="how" className="bg-rose-50 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Захиалга хэрхэн хийх вэ?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((step, idx) => (
            <div key={step.title} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {idx + 1}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
