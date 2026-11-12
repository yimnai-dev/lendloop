import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "~/components/app/PageHeader";
import { EditListing } from "~/components/listings/EditListing";
import { toolIdFrom } from "~/lib/ids";

export const metadata = { title: "Edit listing" };

async function Edit({ params }: Pick<PageProps<"/listings/[toolId]/edit">, "params">) {
  const toolId = toolIdFrom((await params).toolId);
  if (toolId === undefined) notFound();
  return <EditListing toolId={toolId} />;
}

export default function EditListingPage(props: PageProps<"/listings/[toolId]/edit">) {
  return (
    <section className="mx-auto grid w-full max-w-2xl gap-10">
      <PageHeader eyebrow="Your shelf" title="Edit listing" />
      <Suspense>
        <Edit params={props.params} />
      </Suspense>
    </section>
  );
}
