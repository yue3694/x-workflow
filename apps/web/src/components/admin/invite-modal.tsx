"use client";

import { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@x-workflow/ui/components/dialog";
import { Button } from "@x-workflow/ui/components/button";
import { Input } from "@x-workflow/ui/components/input";
import { Label } from "@x-workflow/ui/components/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@x-workflow/ui/components/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { trpc } from "@/utils/trpc";
import type { Role } from "./role-badge";

const inviteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "editor", "viewer"]),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function InviteModal({ open, onOpenChange, onSuccess }: InviteModalProps) {
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState<InviteFormData>({
    name: "",
    email: "",
    role: "viewer",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof InviteFormData, string>>>(
    {},
  );

  const inviteMemberMutation = trpc.admin.inviteMember.useMutation({
    onSuccess: () => {
      void utils.admin.listUsers.invalidate();
      setFormData({ name: "", email: "", role: "viewer" });
      setErrors({});
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        setErrors({ email: "A user with this email already exists" });
      } else {
        setErrors({ email: error.message });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = inviteSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof InviteFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof InviteFormData;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    inviteMemberMutation.mutate(result.data);
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as Role }));
  };

  const roleLabels: Record<Role, string> = {
    admin: "Admin",
    editor: "Editor",
    viewer: "Viewer",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Send an invitation to a new team member
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Enter name"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, email: e.target.value }));
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="Enter email"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Role</Label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                      {roleLabels[formData.role]}
                      <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start">
                  <DropdownMenuRadioGroup
                    value={formData.role}
                    onValueChange={handleRoleChange}
                  >
                    <DropdownMenuRadioItem value="admin">
                      Admin
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="editor">
                      Editor
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="viewer">
                      Viewer
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMemberMutation.isPending}>
              {inviteMemberMutation.isPending ? "Inviting..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { InviteModal };