import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import TaxAssessors from "../../components/TaxAssessors";

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
      <hr style={{ margin: '24px 0' }} />
      <h2>Nearby Tax Assessors</h2>
      <TaxAssessors />
    </div>
  );
}
