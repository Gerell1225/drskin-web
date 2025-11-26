import { MapPin, PhoneCall, Clock, ExternalLink } from "lucide-react";
import { BRANCHES } from "../../lib/data.mock";


export function Contact() {
  return (
    <section id="contact" className="py-16 md:py-24 bg-[#F7F7F7]">
      <div className="mx-auto max-w-[1200px] px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">Холбоо барих</h2>
          <p className="text-sm md:text-base text-gray-600 mt-2">Асуух зүйл байвал бидэнтэй холбогдоорой.</p>
          <form className="mt-6 grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium">Нэр</label>
              <input className="mt-2 w-full rounded-xl border px-3 py-2.5" placeholder="Таны нэр" />
            </div>
            <div>
              <label className="text-sm font-medium">Утас</label>
              <input className="mt-2 w-full rounded-xl border px-3 py-2.5" placeholder="9xxxxxxx" />
            </div>
            <div>
              <label className="text-sm font-medium">Таны хүсэлт</label>
              <textarea className="mt-2 w-full rounded-xl border px-3 py-2.5 h-28" placeholder="..."/>
            </div>
            <button type="button" className="inline-flex items-center justify-center px-5 py-3 rounded-2xl text-white bg-[#D42121] font-medium">Илгээх</button>
          </form>
        </div>
        <div className="rounded-2xl bg-white border p-5 shadow-sm">
          <h3 className="font-medium text-lg">Салбаруудын хаяг</h3>
          <div className="mt-4 space-y-4 text-sm">
            {BRANCHES.map((b) => (
              <div key={b.id} className="pb-4 border-b last:border-none">
                <p className="font-medium">{b.name}</p>
                <p className="text-gray-700 flex items-center gap-2"><MapPin className="h-4 w-4" /> {b.addr}</p>
                <p className="text-gray-700 flex items-center gap-2"><PhoneCall className="h-4 w-4" /> {b.phone}</p>
                <p className="text-gray-700 flex items-center gap-2"><Clock className="h-4 w-4" /> {b.hours}</p>
                {b.mapUrl && (
                  <a href={b.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-[#D42121]">
                    <ExternalLink className="h-4 w-4" /> Газрын зураг нээх
                  </a>
                )}
              </div>
            ))}
            <div className="h-40 rounded-xl bg-gray-200 grid place-items-center text-gray-600">Map embed placeholder</div>
          </div>
        </div>
      </div>
    </section>
  );
}
