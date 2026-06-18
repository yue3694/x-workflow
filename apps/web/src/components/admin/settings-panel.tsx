"use client";

import { Switch } from "@x-workflow/ui/components/switch";
import { Label } from "@x-workflow/ui/components/label";
import { trpc } from "~/utils/trpc";

type SettingsResponse = {
  strictHierarchy: boolean;
  encryptionVault: boolean;
  externalAccess: boolean;
};

interface SettingsPanelProps {
  settings: SettingsResponse;
}

function SettingsPanel({ settings: initialSettings }: SettingsPanelProps) {
  const utils = trpc.useUtils();

  const { data: settings = initialSettings, isLoading } = trpc.admin.getSettings.useQuery(
    undefined,
    {
      initialData: initialSettings,
    },
  );

  const updateSettingsMutation = trpc.admin.updateSettings.useMutation({
    onSuccess: () => {
      void utils.admin.getSettings.invalidate();
    },
  });

  const handleToggle = (key: keyof Omit<SettingsResponse, never>, value: boolean) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  return (
    <div className="border-t">
      <div className="px-4 py-3">
        <h2 className="text-sm font-medium">Security Settings</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Configure system security and access policies
        </p>
      </div>

      <div className="space-y-4 px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Label htmlFor="strict-hierarchy" className="text-xs font-medium">
              Strict Hierarchy
            </Label>
            <p className="text-xs text-muted-foreground">
              Require explicit role-based permissions for all operations
            </p>
          </div>
          <Switch
            id="strict-hierarchy"
            checked={settings.strictHierarchy}
            onCheckedChange={(checked) => handleToggle("strictHierarchy", checked)}
            disabled={isLoading || updateSettingsMutation.isPending}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Label htmlFor="encryption-vault" className="text-xs font-medium">
              Encryption Vault
            </Label>
            <p className="text-xs text-muted-foreground">
              Enable end-to-end encryption for sensitive data
            </p>
          </div>
          <Switch
            id="encryption-vault"
            checked={settings.encryptionVault}
            onCheckedChange={(checked) => handleToggle("encryptionVault", checked)}
            disabled={isLoading || updateSettingsMutation.isPending}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Label htmlFor="external-access" className="text-xs font-medium">
              External Access
            </Label>
            <p className="text-xs text-muted-foreground">
              Allow access from external networks and third-party integrations
            </p>
          </div>
          <Switch
            id="external-access"
            checked={settings.externalAccess}
            onCheckedChange={(checked) => handleToggle("externalAccess", checked)}
            disabled={isLoading || updateSettingsMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}

export { SettingsPanel };