"use client";

import { cn } from "@x-workflow/ui/lib/utils";

type Role = "admin" | "editor" | "viewer";

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

const roleStyles: Record<Role, string> = {
  admin: "bg-destructive/10 text-destructive",
  editor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  viewer: "bg-muted text-muted-foreground",
};

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none px-2 py-0.5 text-xs font-medium",
        roleStyles[role],
        className,
      )}
    >
      {roleLabels[role]}
    </span>
  );
}

export { RoleBadge, type Role };