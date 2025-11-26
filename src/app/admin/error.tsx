"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-red-600">Алдаа гарлаа</h1>
        <p className="mt-2 text-sm text-gray-600">{error.message}</p>
        <button onClick={reset} className="mt-4 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
          Дахин ачаалах
        </button>
      </div>
    </div>
  );
}
