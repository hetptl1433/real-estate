"use client";
import { SessionProvider } from "next-auth/react";
import AuthButton from "./AuthButton";

export default function AuthProvider({ children }) {
  return (
    <SessionProvider>
      {/* <AuthButton /> */}
      {children}
    </SessionProvider>
  );
}
