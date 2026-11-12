import Link from "next/link";
import { MyListings } from "~/components/listings/MyListings";
import { Button } from "~/components/ui/button";

export default function ListingsPage() {
  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My listings</h1>
        <Button asChild>
          <Link href="/listings/new">New listing</Link>
        </Button>
      </div>
      <MyListings />
    </section>
  );
}
