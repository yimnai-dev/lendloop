import { LoanList } from "~/components/loans/LoanList";

export default function IncomingPage() {
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold">Incoming requests</h1>
      <LoanList as="lender" />
    </section>
  );
}
