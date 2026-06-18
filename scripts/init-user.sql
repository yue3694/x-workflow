-- Initialize test user
INSERT OR REPLACE INTO user (id, name, email, email_verified, role, created_at, updated_at)
VALUES ('admin-user-001', 'Admin', 'admin@example.com', 1, 'admin', 1718700000000, 1718700000000);

INSERT OR REPLACE INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
VALUES ('admin-account-001', 'admin@example.com', 'credential', 'admin-user-001', NULL, 1718700000000, 1718700000000);
