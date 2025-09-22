
"use client";
import React, { useEffect } from "react";
import { getCsrfToken } from "next-auth/react";
import { useSearchParams } from "next/navigation";


export default function SignIn() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [csrfToken, setCsrfToken] = React.useState("");

  useEffect(() => {
    getCsrfToken().then(token => setCsrfToken(token));
    if (error) {
      alert("Invalid credentials");
    }
  }, [error]);

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 32 }}>
      <h2>Sign in</h2>
      <form method="post" action="/api/auth/callback/credentials">
        <input name="csrfToken" type="hidden" value={csrfToken} />
  <input name="callbackUrl" type="hidden" value="/" />
        <div>
          <label>Username</label>
          <input name="username" type="text" required />
        </div>
        <div>
          <label>Password</label>
          <input name="password" type="password" required />
        </div>
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
