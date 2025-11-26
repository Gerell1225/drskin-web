import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default function withAdmin(Component: () => ReactNode) {
  return function AdminGate() {
    const cookieStore = cookies();
    const role = cookieStore.get("role")?.value;
    if (role !== "admin") {
      redirect("/");
    }
    return <>{Component()}</>;
  };
}
