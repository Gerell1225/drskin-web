import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default function withAdmin(Component: () => ReactNode) {
  return async function AdminGate() {
    const cookieStore = cookies();
    const role = ( await cookieStore ).get("role")?.value;
    if (role !== "admin") {
      redirect("/");
    }
    return <>{Component()}</>;
  };
}
