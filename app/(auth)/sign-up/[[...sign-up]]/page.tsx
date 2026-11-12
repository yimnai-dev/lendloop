import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export const metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUp />
    </Suspense>
  );
}
