"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoleBadge, type Role } from "./role-badge";
import { Button } from "@x-workflow/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@x-workflow/ui/components/dialog";
import { trpc } from "~/utils/trpc";

type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  createdAt: Date | null;
  updatedAt: Date | null;
};

interface UserTableProps {
  users: User[];
  currentUserId: string;
  onInviteClick: () => void;
}

function UserTable({ users, currentUserId, onInviteClick }: UserTableProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      void utils.admin.listUsers.invalidate();
      setDeleteUserId(null);
      setDeletingUser(null);
    },
    onError: (error) => {
      console.error("Delete user error:", error.message);
      setDeleteUserId(null);
      setDeletingUser(null);
    },
  });

  const handleDeleteClick = (userId: string) => {
    setDeleteUserId(userId);
  };

  const handleConfirmDelete = () => {
    if (deleteUserId) {
      setDeletingUser(deleteUserId);
      deleteUserMutation.mutate({ userId: deleteUserId });
    }
  };

  const handleCancelDelete = () => {
    setDeleteUserId(null);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getUserById = (id: string) => users.find((u) => u.id === id);

  return (
    <>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-medium">Users</h2>
        <Button onClick={onInviteClick} size="sm">
          Add Member
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs">
              <th className="px-4 py-2 font-medium">User</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Last Active</th>
              <th className="px-4 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(user.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.id !== currentUserId && (
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => handleDeleteClick(user.id)}
                        disabled={user.role === "admin" || deletingUser === user.id}
                      >
                        {deletingUser === user.id ? "Deleting..." : "Delete"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={deleteUserId !== null} onOpenChange={handleCancelDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {getUserById(deleteUserId ?? "")?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { UserTable, type User };