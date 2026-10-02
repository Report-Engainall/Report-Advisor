import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  },
});

function isServiceRole(token) {
  try {
    const payload = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!payload) return false;
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    return JSON.parse(atob(padded)).role === "service_role";
  } catch {
    return false;
  }
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { autoRefreshToken: false, persistSession: false } },
);Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ") || !isServiceRole(auth.slice(7))) {
    return json({ error: "SERVICE_ROLE_REQUIRED" }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "INVALID_JSON" }, 400);
  }

  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "");
  const metadata = body?.metadata && typeof body.metadata === "object" ? body.metadata : {};
  if (!email || !password) return json({ error: "EMAIL_AND_PASSWORD_REQUIRED" }, 400);
  if (password.length < 8) return json({ error: "PASSWORD_TOO_SHORT" }, 400);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const created = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (!created.error) {
      return json({
        ok: true,
        userId: created.data.user?.id ?? null,
        email: created.data.user?.email ?? email,
        created: true,
      });
    }

    const message = String(created.error.message ?? "").toLowerCase();
    if (message.includes("already registered")) {
      const listed = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (!listed.error) {
        const existing = (listed.data.users ?? []).find(
          (user) => user.email?.toLowerCase() === email.toLowerCase(),
        );
        if (existing) {
          const updated = await supabase.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: true,
            user_metadata: { ...existing.user_metadata, ...metadata },
          });
          if (!updated.error) {
            return json({
              ok: true,
              userId: updated.data.user?.id ?? existing.id,
              email: updated.data.user?.email ?? email,
              created: false,
            });
          }
        }
      }
    }

    if (![408, 425, 429, 500, 502, 503, 504].includes(Number(created.error.status))) {
      return json({ error: created.error.message }, 502);
    }

    await new Promise((resolve) => setTimeout(resolve, Math.min(4000, 500 * 2 ** (attempt - 1))));
  }

  return json({ error: "AUTH_PROVISION_RETRY_EXHAUSTED" }, 504);
});