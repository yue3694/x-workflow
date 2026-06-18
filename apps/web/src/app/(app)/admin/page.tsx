"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { UserTable, type User } from "@/components/admin/user-table";
import { InviteModal } from "@/components/admin/invite-modal";
import { SettingsPanel } from "@/components/admin/settings-panel";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@x-workflow/ui/components/card";
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@x-workflow/ui/components/skeleton";

type AdminSettings = {
  strictHierarchy: boolean;
  encryptionVault: boolean;
  externalAccess: boolean;
};

function AdminPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const { data: users = [], isLoading: usersLoading } = trpc.admin.listUsers.useQuery(
    undefined,
    {
      enabled: !!session,
    },
  );
  const { data: settings } = trpc.admin.getSettings.useQuery(undefined, {
    enabled: !!session,
  });

  const currentUserId = session?.user?.id ?? "";

  if (sessionLoading) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const defaultSettings: AdminSettings = {
    strictHierarchy: false,
    encryptionVault: false,
    externalAccess: false,
  };

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="font-headline text-xl font-semibold">System Administration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage users, roles, and system settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Pro Upgrade Card - UI placeholder */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>
              Unlock advanced features including SSO, audit logs, and custom roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              className="bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Upgrade Now
            </button>
          </CardContent>
        </Card>

        {/* User Directory */}
        <Card>
          <UserTable
            users={users as User[]}
            currentUserId={currentUserId}
            onInviteClick={() => setInviteModalOpen(true)}
          />
        </Card>

        {/* Settings Panel */}
        <Card>
          <SettingsPanel settings={(settings ?? defaultSettings) as AdminSettings} />
        </Card>
      </div>

      <InviteModal open={inviteModalOpen} onOpenChange={setInviteModalOpen} />
    </div>
  );
}

export default AdminPage;