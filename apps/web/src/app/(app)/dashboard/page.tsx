import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import Dashboard from "./dashboard";

export default async function DashboardPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div>
      <h1 className="font-headline text-xl font-semibold">Dashboard</h1>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">Welcome {session.user.name}</p>
      <Dashboard session={session} />
    </div>
  );
}
