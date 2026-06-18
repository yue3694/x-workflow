import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@x-workflow/db";
import { systemSettings, SETTING_KEYS } from "@x-workflow/db/schema/admin";
import { user } from "@x-workflow/db/schema/auth";
import { adminProcedure, router } from "../index";

/**
 * Generate unique ID
 */
function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * User type for API responses
 */
export type UserResponse = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "admin" | "editor" | "viewer";
  createdAt: Date | null;
  updatedAt: Date | null;
};

/**
 * System settings response type
 */
export type SettingsResponse = {
  [key: string]: boolean;
};

export const adminRouter = router({
  /**
   * List all users (admin only)
   */
  listUsers: adminProcedure.query(async () => {
    const users = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }).from(user);

    return users;
  }),

  /**
   * Invite a new member (admin only)
   */
  inviteMember: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        role: z.enum(["admin", "editor", "viewer"]).default("viewer"),
      }),
    )
    .mutation(async ({ input }) => {
      // Check if email already exists
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      const newUser = {
        id: generateId(),
        name: input.name,
        email: input.email,
        role: input.role,
        emailVerified: false,
        image: null,
      };

      await db.insert(user).values(newUser);

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: new Date(),
      };
    }),

  /**
   * Delete a user (admin only)
   * Cannot delete self or other admins
   */
  deleteUser: adminProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Prevent self-delete
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete your own account",
        });
      }

      // Check if target user exists
      const targetUser = await db
        .select()
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      if (targetUser.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Prevent deleting other admins
      const target = targetUser[0];
      if (!target) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      if (target.role === "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete admin users",
        });
      }

      await db.delete(user).where(eq(user.id, input.userId));

      return { success: true };
    }),

  /**
   * Get system settings (admin only)
   */
  getSettings: adminProcedure.query(async () => {
    const settings = await db
      .select({
        key: systemSettings.key,
        value: systemSettings.value,
      })
      .from(systemSettings);

    const result: SettingsResponse = {
      strictHierarchy: false,
      encryptionVault: false,
      externalAccess: false,
    };

    for (const setting of settings) {
      if (setting.key === SETTING_KEYS.STRICT_HIERARCHY) {
        result.strictHierarchy = setting.value === "true";
      } else if (setting.key === SETTING_KEYS.ENCRYPTION_VAULT) {
        result.encryptionVault = setting.value === "true";
      } else if (setting.key === SETTING_KEYS.EXTERNAL_ACCESS) {
        result.externalAccess = setting.value === "true";
      }
    }

    return result;
  }),

  /**
   * Update system settings (admin only)
   */
  updateSettings: adminProcedure
    .input(
      z.object({
        strictHierarchy: z.boolean().optional(),
        encryptionVault: z.boolean().optional(),
        externalAccess: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const updates = [
        { key: SETTING_KEYS.STRICT_HIERARCHY, value: input.strictHierarchy },
        { key: SETTING_KEYS.ENCRYPTION_VAULT, value: input.encryptionVault },
        { key: SETTING_KEYS.EXTERNAL_ACCESS, value: input.externalAccess },
      ];

      for (const update of updates) {
        if (update.value === undefined) continue;

        const existing = await db
          .select()
          .from(systemSettings)
          .where(eq(systemSettings.key, update.key))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(systemSettings)
            .set({ value: String(update.value), updatedAt: new Date() })
            .where(eq(systemSettings.key, update.key));
        } else {
          await db.insert(systemSettings).values({
            id: generateId(),
            key: update.key,
            value: String(update.value),
          });
        }
      }

      return { success: true };
    }),
});

export type AdminRouter = typeof adminRouter;