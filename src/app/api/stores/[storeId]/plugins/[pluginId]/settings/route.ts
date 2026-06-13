import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ storeId: string; pluginId: string }> };

// GET — get plugin settings for this store
export async function GET(req: NextRequest, { params }: Params) {
  const { storeId, pluginId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const storePlugin = await prisma.storePlugin.findUnique({
    where: { storeId_pluginId: { storeId, pluginId } },
    include: { plugin: true },
  });

  if (!storePlugin) return error("Plugin not installed", 404);

  const manifest = storePlugin.plugin.config as Record<string, unknown> | null;
  const settingsSchema = (manifest?.settingsSchema as unknown[]) || [];
  const defaultSettings = (manifest?.defaultSettings as Record<string, unknown>) || {};

  return success({
    pluginId: storePlugin.pluginId,
    pluginName: storePlugin.plugin.name,
    pluginSlug: storePlugin.plugin.slug,
    isEnabled: storePlugin.isEnabled,
    settingsSchema,
    settings: { ...defaultSettings, ...(storePlugin.settings as Record<string, unknown> || {}) },
    hooks: (manifest?.hooks as unknown[]) || [],
    permissions: (manifest?.permissions as string[]) || [],
  });
}

// PATCH — update plugin settings
export async function PATCH(req: NextRequest, { params }: Params) {
  const { storeId, pluginId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const storePlugin = await prisma.storePlugin.findUnique({
    where: { storeId_pluginId: { storeId, pluginId } },
  });
  if (!storePlugin) return error("Plugin not installed", 404);

  const body = await req.json();
  const { settings, isEnabled } = body;

  const data: Record<string, unknown> = {};
  if (settings !== undefined) data.settings = settings;
  if (isEnabled !== undefined) data.isEnabled = isEnabled;

  const updated = await prisma.storePlugin.update({
    where: { id: storePlugin.id },
    data,
    include: { plugin: true },
  });

  return success(updated);
}
