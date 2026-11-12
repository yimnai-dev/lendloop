import { LoanList } from "~/components/loans/LoanList";

export default function RequestsPage() {
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold">My requests</h1>
      <LoanList as="borrower" />
    </section>
  );
}
