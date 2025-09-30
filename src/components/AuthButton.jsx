"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontWeight: 600 }}>
          {session.user.name || session.user.email}
        </span>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }
  return <button onClick={() => signIn()}>Sign in</button>;
}
