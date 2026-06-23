// =============================================================================
// sync-converty-sheet  —  POST /functions/v1/sync-converty-sheet
// Reads the Converty Google Sheet and creates conversions for delivered orders
// whose Note column contains a known affiliate ref_code.
// Auth: admin (or direct service_role / CRON).
// Body: { spreadsheet_id, sheet_name? }
//
// Returns: { processed, new_conversions, skipped, errors[] }
// =============================================================================
import { serviceClient, requireAdmin } from "../_shared/supabase.ts";
import { ok, fail, handlePreflight } from "../_shared/cors.ts";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

// ---- Google service-account auth (RS256 JWT -> access token) ---------------
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [A-Z ]+-----/, "")
    .replace(/-----END [A-Z ]+-----/, "")
    .replace(/\s+/g, "");
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

function base64url(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(JSON.stringify({
    iss: sa.client_email,
    scope: SHEETS_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));
  const signingInput = `${header}.${claim}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput)),
  );
  const jwt = `${signingInput}.${base64url(sig)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token error: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.access_token as string;
}

async function readSheet(
  token: string,
  spreadsheetId: string,
  range: string,
): Promise<string[][]> {
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}` +
    `/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Sheets API error: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return (json.values ?? []) as string[][];
}

// Extract the first known ref_code token from a free-text note.
function extractRefCandidates(note: string): string[] {
  // ref codes are 8 lowercase hex chars; also accept "ref=xxxx" patterns.
  const tokens = new Set<string>();
  const eq = note.match(/ref[=:\s]+([a-z0-9]{4,32})/gi);
  if (eq) for (const m of eq) tokens.add(m.split(/[=:\s]+/)[1].toLowerCase());
  const hex = note.match(/\b[a-f0-9]{8}\b/gi);
  if (hex) for (const m of hex) tokens.add(m.toLowerCase());
  return [...tokens];
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return fail("Method not allowed", 405);

  // Admin / service_role only.
  const auth = await requireAdmin(req);
  if (!auth.ok) return fail(auth.error, auth.status);

  try {
    const { spreadsheet_id, sheet_name } = await req.json().catch(() => ({}));
    if (!spreadsheet_id) return fail("spreadsheet_id is required", 400);
    const sheet = sheet_name || "Sheet1";

    const saRaw = Deno.env.get("GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON");
    if (!saRaw) return fail("GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON is not configured", 500);
    const sa = JSON.parse(saRaw) as ServiceAccount;

    const token = await getAccessToken(sa);
    const rows = await readSheet(token, spreadsheet_id, sheet);

    if (rows.length < 2) {
      return ok({ processed: 0, new_conversions: 0, skipped: 0, errors: [] });
    }

    // Map header names -> column index (case-insensitive).
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const col = (name: string) => header.indexOf(name.toLowerCase());
    const idx = {
      reference: col("Reference"),
      status: col("Status"),
      note: col("Note"),
      total: col("Total Price"),
    };
    if (idx.status < 0 || idx.note < 0 || idx.total < 0 || idx.reference < 0) {
      return fail("Sheet is missing required columns (Reference, Status, Note, Total Price)", 422);
    }

    const supabase = serviceClient();
    const errors: string[] = [];
    let processed = 0;
    let created = 0;
    let skipped = 0;

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const status = (row[idx.status] ?? "").trim().toLowerCase();
      if (status !== "delivered") continue;

      processed++;
      const orderRef = (row[idx.reference] ?? "").trim();
      const note = row[idx.note] ?? "";
      const totalRaw = (row[idx.total] ?? "").replace(/[^\d.,-]/g, "").replace(",", ".");
      const saleAmount = parseFloat(totalRaw);

      if (!orderRef) { skipped++; continue; }
      if (!isFinite(saleAmount) || saleAmount <= 0) {
        errors.push(`Row ${r + 1}: invalid Total Price "${row[idx.total]}"`);
        skipped++;
        continue;
      }

      // Already imported?
      const { data: existing } = await supabase
        .from("conversions")
        .select("id")
        .eq("order_reference", orderRef)
        .maybeSingle();
      if (existing) { skipped++; continue; }

      // Find an affiliate link whose ref_code appears in the Note.
      const candidates = extractRefCandidates(note);
      if (candidates.length === 0) { skipped++; continue; }

      const { data: link } = await supabase
        .from("affiliate_links")
        .select("id, campaign_id, creator_id, campaigns!inner(brand_id)")
        .in("ref_code", candidates)
        .maybeSingle();

      if (!link) { skipped++; continue; }
      // deno-lint-ignore no-explicit-any
      const brandId = (link as any).campaigns.brand_id;

      const { error: insErr } = await supabase.from("conversions").insert({
        affiliate_link_id: link.id,
        campaign_id: link.campaign_id,
        creator_id: link.creator_id,
        brand_id: brandId,
        order_reference: orderRef,
        sale_amount: saleAmount,
        source: "sheet",
        status: "confirmed", // delivered orders are confirmed sales
      });

      if (insErr) {
        if (insErr.code === "23505") { skipped++; continue; } // race dup
        errors.push(`Row ${r + 1} (${orderRef}): ${insErr.message}`);
        skipped++;
        continue;
      }
      created++;
    }

    return ok({ processed, new_conversions: created, skipped, errors });
  } catch (e) {
    return fail(`Sync failed: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
});
