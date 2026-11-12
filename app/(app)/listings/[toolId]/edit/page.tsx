import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EditListing } from "~/components/listings/EditListing";
import { toolIdFrom } from "~/lib/ids";

async function Edit({ params }: Pick<PageProps<"/listings/[toolId]/edit">, "params">) {
  const toolId = toolIdFrom((await params).toolId);
  if (toolId === undefined) notFound();
  return <EditListing toolId={toolId} />;
}

export default function EditListingPage(props: PageProps<"/listings/[toolId]/edit">) {
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold">Edit listing</h1>
      <Suspense>
        <Edit params={props.params} />
      </Suspense>
    </section>
  );
}
