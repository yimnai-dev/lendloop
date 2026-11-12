import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "~/components/app/PageHeader";
import { MyListings } from "~/components/listings/MyListings";
import { Button } from "~/components/ui/button";

export const metadata = { title: "My listings" };

export default function ListingsPage() {
  return (
    <section className="grid gap-8">
      <PageHeader
        title="My listings"
        description="What you're sharing with the neighborhood."
        actions={
          <Button asChild>
            <Link href="/listings/new">
              <PlusIcon aria-hidden />
              New listing
            </Link>
          </Button>
        }
      />
      <MyListings />
    </section>
  );
}
