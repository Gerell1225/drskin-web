import { expect, test } from "vitest";
import { BRANCH_SERVICES } from "../../../lib/data.mock";


function priceFor(branchId: string, serviceId: string) {
  const item = BRANCH_SERVICES.find((bs) => bs.branchId === branchId && bs.serviceId === serviceId);
  return item ? item.price : null;
}

test("priceFor returns branch-specific price", () => {
  expect(priceFor("b1", "s1")).toBe(59000);
  expect(priceFor("b2", "s1")).toBe(69000);
  expect(priceFor("b3", "s1")).toBeNull();
});

test("branch-services combos exist only when defined", () => {
  expect(priceFor("b2", "s4")).toBe(259000);
  expect(priceFor("b1", "s4")).toBeNull();
});
