import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, uuid } from "drizzle-orm/pg-core";

/**
 * System Settings Table
 * Stores key-value pairs for system configuration
 */
export const systemSettings = pgTable(
  "system_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(),
    value: text("value").notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("system_settings_key_idx").on(table.key)]
);

/**
 * Role type for RBAC
 */
export type UserRole = "admin" | "editor" | "viewer";

export const systemSettingsRelations = relations(systemSettings, () => ({}));

/**
 * Predefined setting keys
 */
export const SETTING_KEYS = {
  STRICT_HIERARCHY: "security.strict_hierarchy",
  ENCRYPTION_VAULT: "security.encryption_vault",
  EXTERNAL_ACCESS: "security.external_access",
} as const;