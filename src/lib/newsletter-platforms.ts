export type Platform = "substack" | "beehiiv" | "mailchimp" | "ghost" | "convertkit" | "buttondown" | "generic";
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
    const { hostname, pathname } = new URL(url);
    if (hostname.endsWith("substack.com")) return "substack";
    if (hostname.endsWith("beehiiv.com") || hostname === "www.beehiiv.com") return "beehiiv";
    if (hostname.includes("mailchimp.com") || hostname.includes("list-manage.com")) return "mailchimp";
    if (hostname.endsWith("ghost.io") || pathname.includes("/ghost/")) return "ghost";
    if (hostname.includes("convertkit.com") || hostname.includes("kit.com")) return "convertkit";
    if (hostname.endsWith("buttondown.email") || hostname.endsWith("buttondown.com")) return "buttondown";
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

// ─── Substack (Edge Function Proxy) ──────────────────────────────────────

async function subscribeSubstack(url: string, email: string): Promise<SubscriptionResult> {
  const domain = getDomain(url);
  const { hostname } = new URL(url);
  const publication = hostname.replace(".substack.com", "");

  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.functions.invoke("subscribe-substack", {
      body: { email, publication },
    });

    if (error) throw new Error(error.message);

    if (data?.success) {
      return { url, domain, platform: "substack", method: "api", status: "subscribed", message: data.message || "Subscribed via API" };
    }

    throw new Error(data?.message || "Unknown error");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    window.open(url, "_blank", "noopener,noreferrer");
    return { url, domain, platform: "substack", method: "manual", status: "opened", message: `Fallback — opened page (${msg})` };
  }
}

// ─── Beehiiv Direct API ─────────────────────────────────────────────────

async function subscribeBeehiiv(url: string, email: string): Promise<SubscriptionResult> {
  const domain = getDomain(url);
  const parsed = new URL(url);
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
    const prefilled = `${subscribeUrl}?email=${encodeURIComponent(email)}`;
    window.open(prefilled, "_blank", "noopener,noreferrer");
    return { url, domain, platform: "beehiiv", method: "prefill", status: "opened", message: `Opened with pre-filled email (${msg.includes("fetch") ? "CORS" : msg})` };
  }
}

// ─── Ghost (Edge Function Proxy) ─────────────────────────────────────────

async function subscribeGhost(url: string, email: string): Promise<SubscriptionResult> {
  const domain = getDomain(url);
  const { origin } = new URL(url);

  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.functions.invoke("subscribe-ghost", {
      body: { email, siteUrl: origin },
    });

    if (error) throw new Error(error.message);

    if (data?.success) {
      return { url, domain, platform: "ghost", method: "api", status: "subscribed", message: data.message || "Subscribed via Ghost magic link" };
    }

    throw new Error(data?.message || "Unknown error");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    window.open(url, "_blank", "noopener,noreferrer");
    return { url, domain, platform: "ghost", method: "manual", status: "opened", message: `Fallback — opened page (${msg})` };
  }
}

// ─── ConvertKit / Kit (Pre-fill) ─────────────────────────────────────────

function subscribeConvertKit(url: string, email: string): SubscriptionResult {
  const domain = getDomain(url);
  const separator = url.includes("?") ? "&" : "?";
  const prefilled = `${url}${separator}email_address=${encodeURIComponent(email)}`;
  window.open(prefilled, "_blank", "noopener,noreferrer");
  return { url, domain, platform: "convertkit", method: "prefill", status: "opened", message: "Opened with email pre-filled — click Subscribe on the page" };
}

// ─── Buttondown (Pre-fill) ──────────────────────────────────────────────

function subscribeButtondown(url: string, email: string): SubscriptionResult {
  const domain = getDomain(url);
  const separator = url.includes("?") ? "&" : "?";
  const prefilled = `${url}${separator}email=${encodeURIComponent(email)}`;
  window.open(prefilled, "_blank", "noopener,noreferrer");
  return { url, domain, platform: "buttondown", method: "prefill", status: "opened", message: "Opened with email pre-filled — click Subscribe on the page" };
}

// ─── Mailchimp Pre-fill ─────────────────────────────────────────────────

function subscribeMailchimp(url: string, email: string): SubscriptionResult {
  const domain = getDomain(url);
  const separator = url.includes("?") ? "&" : "?";
  const prefilled = `${url}${separator}EMAIL=${encodeURIComponent(email)}`;
  window.open(prefilled, "_blank", "noopener,noreferrer");
  return { url, domain, platform: "mailchimp", method: "prefill", status: "opened", message: "Opened with email pre-filled — click Subscribe on the page" };
}

// ─── Generic Fallback ───────────────────────────────────────────────────

function subscribeGeneric(url: string, email: string): SubscriptionResult {
  const domain = getDomain(url);
  const separator = url.includes("?") ? "&" : "?";
  const prefilled = `${url}${separator}email=${encodeURIComponent(email)}`;
  window.open(prefilled, "_blank", "noopener,noreferrer");
  return { url, domain, platform: "generic", method: "manual", status: "opened", message: "Opened site — please subscribe manually" };
}

// ─── Main Subscribe Router ─────────────────────────────────────────────

export async function subscribeToNewsletter(url: string, email: string): Promise<SubscriptionResult> {
  const platform = detectPlatform(url);
  switch (platform) {
    case "substack":    return await subscribeSubstack(url, email);
    case "beehiiv":     return await subscribeBeehiiv(url, email);
    case "ghost":       return await subscribeGhost(url, email);
    case "convertkit":  return subscribeConvertKit(url, email);
    case "buttondown":  return subscribeButtondown(url, email);
    case "mailchimp":   return subscribeMailchimp(url, email);
    default:            return subscribeGeneric(url, email);
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
