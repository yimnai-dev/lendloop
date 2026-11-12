import { PageHeader } from "~/components/app/PageHeader";
import { LoanList } from "~/components/loans/LoanList";

export const metadata = { title: "Incoming requests" };

export default function IncomingPage() {
  return (
    <section className="grid gap-8">
      <PageHeader
        title="Incoming requests"
        description="Neighbors asking to borrow your tools. Approving declines any overlapping requests."
      />
      <LoanList as="lender" />
    </section>
  );
}
