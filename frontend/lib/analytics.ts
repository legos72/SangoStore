/**
 * SangoStore Analytics
 *
 * - Sends page views + custom events to the backend (stored in PostgreSQL)
 * - Optionally forwards to GA4 if NEXT_PUBLIC_GA4_ID is set
 * - Fully anonymous: no user data, just session UUID + device info
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ── Session ID (persistent, anonymous) ───────────────────────────────────────

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem("sango_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("sango_session_id", id);
    }
    return id;
  } catch {
    return "";
  }
}

// ── Device detection ──────────────────────────────────────────────────────────

export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

function getBrowser(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/edg\//i.test(ua))    return "Edge";
  if (/opr\//i.test(ua))    return "Opera";
  if (/chrome/i.test(ua))   return "Chrome";
  if (/firefox/i.test(ua))  return "Firefox";
  if (/safari/i.test(ua))   return "Safari";
  return "Other";
}

function getOS(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/android/i.test(ua))  return "Android";
  if (/iphone|ipad/i.test(ua)) return "iOS";
  if (/windows/i.test(ua))  return "Windows";
  if (/mac os x/i.test(ua)) return "macOS";
  if (/linux/i.test(ua))    return "Linux";
  return "Other";
}

// ── GA4 helper ────────────────────────────────────────────────────────────────

function ga4(eventName: string, params?: Record<string, any>) {
  try {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", eventName, params ?? {});
    }
  } catch {}
}

// ── Core tracking functions ───────────────────────────────────────────────────

/** Track a page view. Called automatically by AnalyticsTracker component. */
export function trackPageView(path: string) {
  ga4("page_view", { page_path: path });

  fetch(`${BASE}/api/analytics/pageview`, {
    method:    "POST",
    headers:   { "Content-Type": "application/json" },
    body:      JSON.stringify({
      path,
      referrer:    typeof document !== "undefined" ? (document.referrer || null) : null,
      device_type: getDeviceType(),
      browser:     getBrowser(),
      os_name:     getOS(),
      session_id:  getSessionId(),
    }),
    keepalive: true,
  }).catch(() => {});
}

/** Track a custom event. */
export function track(eventName: string, properties?: Record<string, any>) {
  ga4(eventName, properties);

  fetch(`${BASE}/api/analytics/event`, {
    method:    "POST",
    headers:   { "Content-Type": "application/json" },
    body:      JSON.stringify({
      event_name: eventName,
      properties: properties ?? null,
      session_id: getSessionId(),
    }),
    keepalive: true,
  }).catch(() => {});
}
