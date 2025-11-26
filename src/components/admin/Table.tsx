export function Table({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-xl border">{children}</div>;
}
export function T({ children }: { children: React.ReactNode }) {
  return <table className="min-w-full text-sm">{children}</table>;
}
export function Th({ children }: { children: React.ReactNode }) {
  return <th className="py-2.5 px-3 text-left text-gray-600">{children}</th>;
}
export function Td({ children }: { children: React.ReactNode }) {
  return <td className="py-2.5 px-3 align-middle">{children}</td>;
}
