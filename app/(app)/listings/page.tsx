import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "~/components/app/PageHeader";
import { MyListings } from "~/components/listings/MyListings";
import { Button } from "~/components/ui/button";

export const metadata = { title: "Your shelf" };

export default function ListingsPage() {
  return (
    <section className="grid grid-cols-1 gap-12">
      <PageHeader
        eyebrow="What you lend"
        title="Your shelf"
        description="Everything you're sharing with the neighborhood."
        actions={
          <Button asChild variant="outline">
            <Link href="/listings/new">
              <PlusIcon aria-hidden />
              List a tool
            </Link>
          </Button>
        }
      />
      <MyListings />
    </section>
  );
}
