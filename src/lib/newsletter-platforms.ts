export type Platform = "substack" | "beehiiv" | "mailchimp" | "generic";
export type SubscriptionStatus = "pending" | "subscribed" | "opened" | "failed";
export type ApproachMethod = "api" | "prefill" | "manual";

export interface SubscriptionResult {
  url: string;
  domain: string;
  platform: Platform;
  method: ApproachMethod;
  status: SubscriptionStatus;
  message: string;
}

// ─── Platform Detection ────────────────────────────────────────────────────

export function detectPlatform(url: string): Platform {
  try {
    const { hostname } = new URL(url);
    if (hostname.endsWith("substack.com")) return "substack";
    if (hostname.endsWith("beehiiv.com") || hostname === "www.beehiiv.com") return "beehiiv";
    if (hostname.includes("mailchimp.com") || hostname.includes("list-manage.com")) return "mailchimp";
    return "generic";
  } catch {
    return "generic";
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ─── Approach 1: Substack Direct API ─────────────────────────────────────

async function subscribeSubstack(url: string, email: string): Promise<SubscriptionResult> {
  const domain = getDomain(url);
  // Extract the subdomain: e.g. "publication.substack.com" → "publication"
  const { hostname } = new URL(url);
  const publication = hostname.replace(".substack.com", "");
  const endpoint = `https://${publication}.substack.com/api/v1/free`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      return { url, domain, platform: "substack", method: "api", status: "subscribed", message: "Successfully subscribed via Substack API" };
    }

    const text = await res.text().catch(() => "");
    // Substack returns 400 if already subscribed
    if (res.status === 400 && text.toLowerCase().includes("already")) {
      return { url, domain, platform: "substack", method: "api", status: "subscribed", message: "Already subscribed" };
    }

    throw new Error(`HTTP ${res.status}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("cors") || msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network")) {
      // CORS fallback → open tab
      window.open(url, "_blank", "noopener,noreferrer");
      return { url, domain, platform: "substack", method: "manual", status: "opened", message: "CORS blocked — opened page manually" };
    }
    return { url, domain, platform: "substack", method: "api", status: "failed", message: `API error: ${msg}` };
  }
}

// ─── Approach 1: Beehiiv Direct API ──────────────────────────────────────

async function subscribeBeehiiv(url: string, email: string): Promise<SubscriptionResult> {
  const domain = getDomain(url);
  // Beehiiv subscribe URLs look like: https://www.beehiiv.com/subscribe/pub_xxxxx
  // We POST to that same URL as a form
  const parsed = new URL(url);
  // Normalise to /subscribe/ path
  let subscribeUrl = url;
  if (!parsed.pathname.startsWith("/subscribe")) {
    subscribeUrl = `https://www.beehiiv.com/subscribe${parsed.pathname}`;
  }

  try {
    const formData = new FormData();
    formData.append("email", email);

    const res = await fetch(subscribeUrl, {
      method: "POST",
      body: formData,
    });

    if (res.ok || res.status === 302) {
      return { url, domain, platform: "beehiiv", method: "api", status: "subscribed", message: "Successfully subscribed via Beehiiv API" };
    }

    throw new Error(`HTTP ${res.status}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // CORS fallback
    const prefilled = `${subscribeUrl}?email=${encodeURIComponent(email)}`;
    window.open(prefilled, "_blank", "noopener,noreferrer");
    return { url, domain, platform: "beehiiv", method: "prefill", status: "opened", message: `Opened with pre-filled email (${msg.includes("fetch") ? "CORS" : msg})` };
  }
}

// ─── Approach 2: Mailchimp Pre-fill ──────────────────────────────────────

function subscribeMailchimp(url: string, email: string): SubscriptionResult {
  const domain = getDomain(url);
  // Mailchimp subscribe form URLs: append ?EMAIL=...
  const separator = url.includes("?") ? "&" : "?";
  const prefilled = `${url}${separator}EMAIL=${encodeURIComponent(email)}`;
  window.open(prefilled, "_blank", "noopener,noreferrer");
  return { url, domain, platform: "mailchimp", method: "prefill", status: "opened", message: "Opened with email pre-filled — click Subscribe on the page" };
}

// ─── Approach 3: Generic Fallback ────────────────────────────────────────

function subscribeGeneric(url: string, email: string): SubscriptionResult {
  const domain = getDomain(url);
  // Try ?email= query param pre-fill, then open
  const separator = url.includes("?") ? "&" : "?";
  const prefilled = `${url}${separator}email=${encodeURIComponent(email)}`;
  window.open(prefilled, "_blank", "noopener,noreferrer");
  return { url, domain, platform: "generic", method: "manual", status: "opened", message: "Opened site — please subscribe manually" };
}

// ─── Main Subscribe Router ────────────────────────────────────────────────

export async function subscribeToNewsletter(url: string, email: string): Promise<SubscriptionResult> {
  const platform = detectPlatform(url);
  switch (platform) {
    case "substack":  return await subscribeSubstack(url, email);
    case "beehiiv":   return await subscribeBeehiiv(url, email);
    case "mailchimp": return subscribeMailchimp(url, email);
    default:          return subscribeGeneric(url, email);
  }
}

export function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
