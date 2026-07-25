/**
 * Vercel Domain Management
 *
 * Adds/removes custom domains via Vercel API.
 * Vercel handles SSL certificates automatically for all added domains.
 * Only active when VERCEL_PROJECT_ID and VERCEL_AUTH_TOKEN are set.
 *
 * Usage:
 *   import { vercelDomains } from "@/lib/domain/vercel-domains";
 *   await vercelDomains.add("shop.example.com");
 *   await vercelDomains.remove("shop.example.com");
 *   const info = await vercelDomains.check("shop.example.com");
 */

const VERCEL_API = "https://api.vercel.com";

function getConfig() {
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  const token = process.env.VERCEL_AUTH_TOKEN;

  if (!projectId || !token) return null;
  return { projectId, teamId, token };
}

function buildUrl(path: string, teamId?: string): string {
  const url = `${VERCEL_API}${path}`;
  return teamId ? `${url}?teamId=${teamId}` : url;
}

async function vercelFetch(path: string, options: RequestInit = {}) {
  const config = getConfig();
  if (!config) throw new Error("Vercel API not configured (VERCEL_PROJECT_ID + VERCEL_AUTH_TOKEN required)");

  const url = buildUrl(path, config.teamId);
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `Vercel API error: ${res.status}`);
  }
  return data;
}

export interface VercelDomainInfo {
  name: string;
  verified: boolean;
  configured: boolean;
  sslReady: boolean;
  verification?: Array<{ type: string; domain: string; value: string }>;
}

export const vercelDomains = {
  /**
   * Check if Vercel domain management is available.
   */
  isAvailable(): boolean {
    return getConfig() !== null;
  },

  /**
   * Add a custom domain to the Vercel project.
   * Vercel automatically provisions SSL for verified domains.
   */
  async add(domain: string): Promise<VercelDomainInfo> {
    const config = getConfig();
    if (!config) throw new Error("Vercel API not configured");

    const data = await vercelFetch(`/v10/projects/${config.projectId}/domains`, {
      method: "POST",
      body: JSON.stringify({ name: domain }),
    });

    return {
      name: data.name,
      verified: data.verified ?? false,
      configured: true,
      sslReady: data.verified ?? false,
      verification: data.verification,
    };
  },

  /**
   * Remove a custom domain from the Vercel project.
   */
  async remove(domain: string): Promise<void> {
    const config = getConfig();
    if (!config) throw new Error("Vercel API not configured");

    await vercelFetch(`/v9/projects/${config.projectId}/domains/${domain}`, {
      method: "DELETE",
    });
  },

  /**
   * Check domain status (DNS, verification, SSL).
   */
  async check(domain: string): Promise<VercelDomainInfo> {
    const config = getConfig();
    if (!config) throw new Error("Vercel API not configured");

    const data = await vercelFetch(`/v9/projects/${config.projectId}/domains/${domain}`);

    return {
      name: data.name,
      verified: data.verified ?? false,
      configured: data.configured ?? false,
      sslReady: data.verified && data.configured,
      verification: data.verification,
    };
  },

  /**
   * Verify a domain (trigger DNS check).
   */
  async verify(domain: string): Promise<VercelDomainInfo> {
    const config = getConfig();
    if (!config) throw new Error("Vercel API not configured");

    const data = await vercelFetch(`/v9/projects/${config.projectId}/domains/${domain}/verify`, {
      method: "POST",
    });

    return {
      name: data.name,
      verified: data.verified ?? false,
      configured: data.configured ?? false,
      sslReady: data.verified && data.configured,
      verification: data.verification,
    };
  },
};
