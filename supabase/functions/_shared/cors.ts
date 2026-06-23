// Shared CORS headers + JSON response helpers for all edge functions.

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Standard envelope: { success, data?, error? }
export function jsonResponse(
  body: { success: boolean; data?: unknown; error?: string },
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function ok(data: unknown, status = 200): Response {
  return jsonResponse({ success: true, data }, status);
}

export function fail(error: string, status = 400): Response {
  return jsonResponse({ success: false, error }, status);
}

// Preflight handler — returns a Response for OPTIONS, otherwise null.
export function handlePreflight(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}
