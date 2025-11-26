import { ChevronRight } from "lucide-react";
import { PRIMARY } from "./utils";

export function Hero() {
  return (
    <section id="home" className="relative">
      <div className="relative">
        <div className="h-[68vh] md:h-[78vh] w-full bg-[url('/HeroPic.jpg')] bg-cover bg-center rounded-b-[32px] md:rounded-b-[48px]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.55)_60%,rgba(0,0,0,0.35)_100%)] rounded-b-[32px] md:rounded-b-[48px]" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="max-w-xl text-white">
              <span className="inline-flex items-center text-[11px] md:text-xs px-2 py-1 rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur">
                ШИНЭ • 2025 оны бэлэг урамшуулал
              </span>
              <h1 className="mt-3 text-3xl md:text-5xl font-semibold leading-tight">
                DrSkin & DrHair — Премиум арьс, үсний арчилгаа
              </h1>
              <p className="mt-3 md:mt-4 text-white/90 text-sm md:text-base">
                Онлайнаар цаг авч, өөртөө илүү цаг гаргаарай.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a
                  href="#booking"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm md:text-base font-medium shadow-lg hover:opacity-95"
                  style={{ background: PRIMARY }}
                >
                  Онлайн захиалга <ChevronRight className="h-4 w-4" />
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/90 text-[#0f0f0f] text-sm md:text-base font-medium shadow hover:bg-white"
                >
                  Үйлчилгээ үзэх
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
