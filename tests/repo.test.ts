import { describe, expect, it } from "vitest";
import { repo } from "@/components/admin/repo";

describe("repo", () => {
  it("upserts branches", () => {
    const id = "new-branch";
    repo.upsertBranch({ id, title: "Test", address: "Addr", phone: "123", hours: "9-18", bedsSkin: 1, bedsHair: 1 });
    const list = repo.listBranches();
    expect(list.some((b) => b.id === id)).toBe(true);
    repo.removeBranch(id);
    expect(repo.listBranches().some((b) => b.id === id)).toBe(false);
  });

  it("manages services and prices", () => {
    const serviceId = "sv-test";
    repo.upsertService({ id: serviceId, name: "Test", category: "Cat", durationMin: 30, kind: "skin" });
    repo.upsertPrice({ branchId: "b1", serviceId, price: 1234 });
    expect(repo.listPrices().find((p) => p.serviceId === serviceId)?.price).toBe(1234);
    repo.removeService(serviceId);
    expect(repo.listServices().some((s) => s.id === serviceId)).toBe(false);
  });

  it("handles bookings lifecycle", () => {
    const id = "bk-test";
    repo.upsertBooking({
      id,
      customer: "Test",
      phone: "9900",
      branchId: "b1",
      serviceId: "s1",
      dateISO: "2025-01-01",
      time: "10:00",
      partySize: 1,
      status: "pending",
      paid: false,
    });
    expect(repo.listBookings().some((b) => b.id === id)).toBe(true);
    repo.removeBooking(id);
    expect(repo.listBookings().some((b) => b.id === id)).toBe(false);
  });
});
