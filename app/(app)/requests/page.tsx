import { PageHeader } from "~/components/app/PageHeader";
import { LoanList } from "~/components/loans/LoanList";

export const metadata = { title: "My requests" };

export default function RequestsPage() {
  return (
    <section className="grid gap-8">
      <PageHeader
        title="My requests"
        description="Things you've asked to borrow. The owner's email appears once they approve."
      />
      <LoanList as="borrower" />
    </section>
  );
}
