-- Platform-wide settings, singleton row keyed by id = 'platform'
CREATE TABLE IF NOT EXISTS "platform_settings" (
  "id"                        TEXT NOT NULL,
  "siteName"                  TEXT NOT NULL DEFAULT 'AfroStore',
  "siteUrl"                   TEXT NOT NULL DEFAULT 'https://afrostore.app',
  "supportEmail"              TEXT NOT NULL DEFAULT 'support@afrostore.app',
  "defaultCurrency"           TEXT NOT NULL DEFAULT 'NGN',
  "defaultCountry"            TEXT NOT NULL DEFAULT 'NG',
  "maintenanceMode"           BOOLEAN NOT NULL DEFAULT false,
  "allowSignups"               BOOLEAN NOT NULL DEFAULT true,
  "requireEmailVerification"  BOOLEAN NOT NULL DEFAULT false,
  "maxStoresPerUser"          INTEGER NOT NULL DEFAULT 5,
  "platformFeePercent"        DECIMAL(5,2) NOT NULL DEFAULT 2.5,
  "smtpHost"                  TEXT,
  "smtpPort"                  TEXT NOT NULL DEFAULT '587',
  "smtpUser"                  TEXT,
  "smtpPass"                  TEXT,
  "sendFromEmail"             TEXT,
  "sendFromName"              TEXT NOT NULL DEFAULT 'AfroStore',
  "updatedAt"                 TIMESTAMP(3) NOT NULL,
  "updatedById"               TEXT,

  CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "platform_settings" ("id", "updatedAt")
VALUES ('platform', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
