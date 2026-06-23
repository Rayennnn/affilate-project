// =============================================================================
// track-click  —  GET /functions/v1/track-click?ref=CODE
// Public, no auth. Logs a click event (async) and 302-redirects to the product.
// Designed to be fast: we only block on the ref lookup, then fire the click
// insert + counter bump in the background via EdgeRuntime.waitUntil.
// =============================================================================
import { serviceClient } from "../_shared/supabase.ts";
import { corsHeaders, handlePreflight } from "../_shared/cors.ts";

// Where to send visitors when the ref code is missing/invalid.
const LANDING_PAGE = Deno.env.get("LANDING_PAGE_URL") ?? "https://converty.shop";

// deno-lint-ignore no-explicit-any
declare const EdgeRuntime: any;

function classifyDevice(ua: string): string {
  const s = ua.toLowerCase();
  if (/tablet|ipad/.test(s)) return "tablet";
  if (/mobi|android|iphone|ipod/.test(s)) return "mobile";
  return "desktop";
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const redirectTo = (url: string) =>
    new Response(null, { status: 302, headers: { ...corsHeaders, Location: url } });

  try {
    const ref = new URL(req.url).searchParams.get("ref");
    if (!ref) return redirectTo(LANDING_PAGE);

    const supabase = serviceClient();

    // Only block on the lookup we actually need for the redirect.
    const { data: link, error } = await supabase
      .from("affiliate_links")
      .select("id, full_url")
      .eq("ref_code", ref)
      .maybeSingle();

    if (error || !link) return redirectTo(LANDING_PAGE);

    // Background work: record the click + increment the counter. Don't block.
    const logClick = (async () => {
      try {
        const ua = req.headers.get("user-agent") ?? "";
        const ip =
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

        await supabase.from("click_events").insert({
          affiliate_link_id: link.id,
          ip_address: ip,
          user_agent: ua,
          referer: req.headers.get("referer"),
          country: req.headers.get("x-vercel-ip-country") ??
            req.headers.get("cf-ipcountry") ?? null,
          device: classifyDevice(ua),
        });

        await supabase.rpc("increment_link_clicks", { p_link_id: link.id });
      } catch (_) {
        // Tracking must never break the redirect — swallow errors.
      }
    })();

    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
      EdgeRuntime.waitUntil(logClick);
    } else {
      // Fallback if waitUntil is unavailable locally.
      await logClick;
    }

    // full_url already contains ?ref=..., so redirect straight to it.
    return redirectTo(link.full_url);
  } catch (_) {
    return redirectTo(LANDING_PAGE);
  }
});
