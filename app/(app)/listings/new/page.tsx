import { PageHeader } from "~/components/app/PageHeader";
import { NewListing } from "~/components/listings/NewListing";

export const metadata = { title: "List a tool" };

export default function NewListingPage() {
  return (
    <section className="mx-auto grid w-full max-w-2xl gap-8">
      <PageHeader
        title="List a tool"
        description="Neighbors see the name, photos and your first name. Never your email or address."
      />
      <NewListing />
    </section>
  );
}
