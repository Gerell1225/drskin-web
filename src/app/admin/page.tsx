import { BookingsPanel } from "@/components/admin/BookingsPanel";
import { BranchesPanel } from "@/components/admin/BranchesPanel";
import { CustomersPanel } from "@/components/admin/CustomersPanel";
import { PricingPanel } from "@/components/admin/PricingPanel";
import { ServicesPanel } from "@/components/admin/ServicesPanel";
import withAdmin from "@/components/admin/withAdmin";
import Link from "next/link";

function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-600">DrSkin & DrHair</p>
              <h1 className="text-2xl font-bold">Админ самбар</h1>
            </div>
            <div className="flex gap-2 text-sm">
              <Link href="/" className="rounded-xl border px-4 py-2">
                Нүүр
              </Link>
              <Link href="/login" className="rounded-xl bg-brand px-4 py-2 font-semibold text-white">
                Системээс гарах
              </Link>
            </div>
          </div>
        </header>

        <BranchesPanel />
        <ServicesPanel />
        <PricingPanel />
        <BookingsPanel />
        <CustomersPanel />
      </div>
    </main>
  );
}

export default withAdmin(AdminPage);
