import { Suspense } from "react";
import { PageHeader } from "~/components/app/PageHeader";
import { LoanList } from "~/components/loans/LoanList";

export const metadata = { title: "Lending" };

export default function IncomingPage() {
  return (
    <section className="grid grid-cols-1 gap-12">
      <PageHeader
        eyebrow="Requests for your tools"
        title="Lending"
        description="Approving a request declines any that overlap it, and both neighbors are emailed."
      />
      {/* The tab lives in the URL, which is request-time data. */}
      <Suspense>
        <LoanList as="lender" />
      </Suspense>
    </section>
  );
}
