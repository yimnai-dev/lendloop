import { NewListing } from "~/components/listings/NewListing";

export default function NewListingPage() {
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold">List a tool</h1>
      <NewListing />
    </section>
  );
}
