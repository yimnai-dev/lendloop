import { Suspense } from "react";
import { PageHeader } from "~/components/app/PageHeader";
import { LoanList } from "~/components/loans/LoanList";

export const metadata = { title: "Borrowing" };

export default function RequestsPage() {
  return (
    <section className="grid grid-cols-1 gap-12">
      <PageHeader
        eyebrow="Your requests"
        title="Borrowing"
        description="What you've asked to borrow. The owner's email appears once they approve."
      />
      {/* The tab lives in the URL, which is request-time data. */}
      <Suspense>
        <LoanList as="borrower" />
      </Suspense>
    </section>
  );
}
