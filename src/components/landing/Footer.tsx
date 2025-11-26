export default function Footer() {
  return (
    <footer className="bg-gray-900 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-gray-300 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-white">DrSkin & DrHair</p>
          <p>Peace Ave 45, Ulaanbaatar • 7711-0011</p>
        </div>
        <div className="flex gap-4">
          <a href="/login" className="hover:text-white">
            Админ
          </a>
          <a href="mailto:hello@drskin.mn" className="hover:text-white">
            hello@drskin.mn
          </a>
        </div>
      </div>
    </footer>
  );
}
