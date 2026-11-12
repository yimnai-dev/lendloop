import { AccountSync } from "~/components/app/AccountSync";
import { AppNav } from "~/components/app/AppNav";
import { Toaster } from "~/components/ui/sonner";

/** Signed-in area. Data access is authorized in Convex; `AccountSync` handles sign-in. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AccountSync />
      <AppNav />
      <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <Toaster richColors />
    </>
  );
}
