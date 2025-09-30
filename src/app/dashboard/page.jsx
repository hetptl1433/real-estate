import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }
  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 32 }}>
      <h1>Dashboard</h1>
      <p>Welcome, <b>{session.user.name || session.user.email}</b>!</p>
      <p>This page is protected and only visible to logged-in users.</p>
    </div>
  );
}
