export function Footer() {
  return (
    <footer className="py-12 border-t bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-[1200px] px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#D42121] shadow-sm shadow-[#D42121]/30" />
            <span className="text-lg font-semibold">DrSkin & DrHair</span>
          </div>
          <p className="text-sm text-gray-600 mt-3">Премиум арьс, үсний арчилгааны төв.</p>
        </div>
        <div>
          <p className="font-medium mb-2">Холбоос</p>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-[#D42121]" href="#services">Үйлчилгээ</a></li>
            <li><a className="hover:text-[#D42121]" href="#branches">Салбарууд</a></li>
            <li><a className="hover:text-[#D42121]" href="#rewards">Оноо</a></li>
            <li><a className="hover:text-[#D42121]" href="#contact">Холбоо барих</a></li>
            <li><a className="hover:text-[#D42121]" href="#booking">Захиалга</a></li>
          </ul>
        </div>
        <div>
          <p className="font-medium mb-2">Хаяг</p>
          <p className="text-sm text-gray-600">Улаанбаатар, Монгол</p>
        </div>
        <div>
          <p className="font-medium mb-2">Холбогдох</p>
          <p className="text-sm text-gray-600">Утас: 77030808</p>
          <p className="text-sm text-gray-600">И-мэйл: hello@drskin.mn</p>
        </div>
      </div>
      <div className="mt-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} DrSkin & DrHair — Бүх эрх хуулиар хамгаалагдсан.</div>
    </footer>
  );
}
