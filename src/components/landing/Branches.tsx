const branches = [
  { title: "Central", address: "Peace Ave 45", map: "https://maps.app.goo.gl/demo1", phone: "+976-7711-0011" },
  { title: "West", address: "Chingeltei 1-23", map: "https://maps.app.goo.gl/demo2", phone: "+976-7711-0022" },
];

export default function Branches() {
  return (
    <section id="branches" className="bg-rose-50 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand">Салбарууд</p>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Бидний байршил</h2>
            <p className="text-gray-600">Өдөр бүр ажиллаж байна. Газрын зураг дээр дарж шууд нээгдэнэ.</p>
          </div>
          <a href="tel:+97677110011" className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm">
            7711-0011
          </a>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {branches.map((branch) => (
            <div key={branch.title} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{branch.title}</h3>
                  <p className="text-sm text-gray-600">{branch.address}</p>
                </div>
                <a href={branch.map} className="text-sm font-semibold text-brand" target="_blank" rel="noreferrer">
                  Газрын зураг
                </a>
              </div>
              <p className="mt-2 text-sm text-gray-700">{branch.phone}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
