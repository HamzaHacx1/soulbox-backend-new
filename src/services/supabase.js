// Minimal Supabase (PostgREST) client. Uses the project's secret key, so it must
// only ever run on the server. Configure SUPABASE_URL and SUPABASE_SECRET_KEY.
const fetch = require("node-fetch");

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.");
  return { url: url.replace(/\/+$/, ""), key };
}

async function request(method, path, { body, prefer, retries = 2 } = {}) {
  const { url, key } = config();
  const headers = { apikey: key, "Content-Type": "application/json" };
  // Legacy service_role keys are JWTs and also go in Authorization; new sb_secret_ keys must not.
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  if (prefer) headers.Prefer = prefer;

  for (let attempt = 0; ; attempt++) {
    let response;
    try {
      response = await fetch(`${url}/rest/v1/${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        timeout: 8000,
      });
    } catch (error) {
      if (attempt < retries) { await wait(300 * (attempt + 1)); continue; }
      throw error;
    }
    if (response.status >= 500 && attempt < retries) { await wait(300 * (attempt + 1)); continue; }
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const error = new Error((data && data.message) || `Supabase ${method} ${path} failed with ${response.status}`);
      error.status = response.status;
      error.code = data && data.code;
      throw error;
    }
    return data;
  }
}

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

const eq = (value) => `eq.${encodeURIComponent(value)}`;

module.exports = {
  insert: (table, row, { ignoreDuplicates = false } = {}) =>
    request("POST", table, {
      body: row,
      prefer: ignoreDuplicates ? "return=representation,resolution=ignore-duplicates" : "return=representation",
    }),
  update: (table, query, patch) => request("PATCH", `${table}?${query}`, { body: patch, prefer: "return=representation" }),
  select: (table, query) => request("GET", `${table}?${query}`),
  eq,
};
