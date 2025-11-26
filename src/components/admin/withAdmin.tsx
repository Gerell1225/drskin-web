import { ReactNode } from "react";

export default function withAdmin(Component: () => ReactNode) {
  return function AdminGate() {
    return <>{Component()}</>;
  };
}
