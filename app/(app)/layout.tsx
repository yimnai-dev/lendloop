import { AccountSync } from "~/components/app/AccountSync";
import { AppNav } from "~/components/app/AppNav";
import { Toaster } from "~/components/ui/sonner";

/** Signed-in area. Data access is authorized in Convex; `AccountSync` handles sign-in. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AccountSync />
      <AppNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
      <Toaster richColors />
    </>
  );
}
