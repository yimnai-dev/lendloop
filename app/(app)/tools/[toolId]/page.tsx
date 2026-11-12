import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ToolDetailView } from "~/components/tools/ToolDetailView";
import { toolIdFrom } from "~/lib/ids";

async function ToolDetail({ params }: Pick<PageProps<"/tools/[toolId]">, "params">) {
  const toolId = toolIdFrom((await params).toolId);
  if (toolId === undefined) notFound();
  return <ToolDetailView toolId={toolId} />;
}

export default function ToolPage(props: PageProps<"/tools/[toolId]">) {
  return (
    <Suspense>
      <ToolDetail params={props.params} />
    </Suspense>
  );
}
