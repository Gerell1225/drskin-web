import { branchServices, branches, bookings, customers, services } from "./data.mock";
import { Booking, Branch, BranchService, Customer, Repo, Service } from "./types";

const clone = <T>(items: T[]): T[] => JSON.parse(JSON.stringify(items));

class MemoryRepo implements Repo {
  private _branches: Branch[] = clone(branches);
  private _services: Service[] = clone(services);
  private _prices: BranchService[] = clone(branchServices);
  private _bookings: Booking[] = clone(bookings);
  private _customers: Customer[] = clone(customers);

  listBranches() {
    return clone(this._branches);
  }

  upsertBranch(branch: Branch) {
    const exists = this._branches.findIndex((b) => b.id === branch.id);
    if (exists >= 0) {
      this._branches[exists] = { ...branch };
    } else {
      this._branches.push({ ...branch });
    }
    return branch;
  }

  removeBranch(id: string) {
    this._branches = this._branches.filter((b) => b.id !== id);
    this._prices = this._prices.filter((p) => p.branchId !== id);
    this._bookings = this._bookings.filter((b) => b.branchId !== id);
  }

  listServices() {
    return clone(this._services);
  }

  upsertService(service: Service) {
    const exists = this._services.findIndex((s) => s.id === service.id);
    if (exists >= 0) {
      this._services[exists] = { ...service };
    } else {
      this._services.push({ ...service });
    }
    return service;
  }

  removeService(id: string) {
    this._services = this._services.filter((s) => s.id !== id);
    this._prices = this._prices.filter((p) => p.serviceId !== id);
    this._bookings = this._bookings.filter((b) => b.serviceId !== id);
  }

  listPrices() {
    return clone(this._prices);
  }

  upsertPrice(price: BranchService) {
    const exists = this._prices.findIndex((p) => p.branchId === price.branchId && p.serviceId === price.serviceId);
    if (exists >= 0) {
      this._prices[exists] = { ...price };
    } else {
      this._prices.push({ ...price });
    }
    return price;
  }

  removePrice(branchId: string, serviceId: string) {
    this._prices = this._prices.filter((p) => !(p.branchId === branchId && p.serviceId === serviceId));
  }

  listBookings() {
    return clone(this._bookings);
  }

  upsertBooking(booking: Booking) {
    const exists = this._bookings.findIndex((b) => b.id === booking.id);
    if (exists >= 0) {
      this._bookings[exists] = { ...booking };
    } else {
      this._bookings.push({ ...booking });
    }
    return booking;
  }

  removeBooking(id: string) {
    this._bookings = this._bookings.filter((b) => b.id !== id);
  }

  listCustomers() {
    return clone(this._customers);
  }

  upsertCustomer(customer: Customer) {
    const exists = this._customers.findIndex((c) => c.id === customer.id);
    if (exists >= 0) {
      this._customers[exists] = { ...customer };
    } else {
      this._customers.push({ ...customer });
    }
    return customer;
  }

  removeCustomer(id: string) {
    this._customers = this._customers.filter((c) => c.id !== id);
  }
}

export const repo = new MemoryRepo();
