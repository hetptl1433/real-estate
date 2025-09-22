import { Suspense } from "react";
import SignInClient from "./SignInClient";

export const dynamic = "force-dynamic"; // auth pages shouldn't be prerendered

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignInClient />
    </Suspense>
  );
}
