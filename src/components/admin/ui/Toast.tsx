"use client";

import { useEffect, useState } from "react";

export function Toast({ message }: { message: string }) {
  const [visible, setVisible] = useState(Boolean(message));
  useEffect(() => {
    if (message) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 2500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [message]);

  if (!visible || !message) return null;
  return <div className="fixed bottom-6 right-6 rounded-xl bg-gray-900 px-4 py-3 text-white shadow-lg">{message}</div>;
}
