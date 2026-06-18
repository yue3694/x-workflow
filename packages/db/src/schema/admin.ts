import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

/**
 * System Settings Table
 * Stores key-value pairs for system configuration
 */
export const systemSettings = sqliteTable(
  "system_settings",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull().unique(),
    value: text("value").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("system_settings_key_idx").on(table.key)],
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