export default function Hero() {
  return (
    <section id="hero" className="bg-gradient-to-b from-white to-rose-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 text-center sm:px-6 sm:py-16">
        <p className="rounded-full bg-rose-100 px-4 py-1 text-xs font-semibold text-brand">Эмчилгээ, гоо сайхны салон</p>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
          DrSkin & DrHair: Арьс, үсний эмчилгээний дэвшилтэт төв
        </h1>
        <p className="max-w-2xl text-lg text-gray-700">
          Онлайн захиалга, урамшууллын оноо, найдвартай эмчилгээ — бүгд нэг дор. Мэргэжлийн эмч, технологиудтай танилцаарай.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a
            href="#services"
            className="rounded-xl bg-brand px-6 py-3 text-center text-base font-semibold text-white shadow-md"
          >
            Одоо цаг авах
          </a>
          <a href="#branches" className="rounded-xl border px-6 py-3 text-center text-base font-semibold text-gray-800">
            Салбарууд
          </a>
        </div>
      </div>
    </section>
  );
}
