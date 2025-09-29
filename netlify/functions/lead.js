export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    const payload = JSON.parse(event.body || "{}");

    // Your secret destination (set in Netlify UI -> Site settings -> Environment variables)
    const url = process.env.CRM_WEBHOOK_URL;
    const auth = process.env.CRM_AUTH_BEARER; // optional, like 'sk_abc...' or JWT

    if (!url) {
      return { statusCode: 500, body: "CRM_WEBHOOK_URL is not set" };
    }

    const headers = { "Content-Type": "application/json" };
    if (auth) headers["Authorization"] = `Bearer ${auth}`;

    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        source: "return-rate-calculator",
        ...payload,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return { statusCode: resp.status, body: text || "CRM webhook error" };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: err.message || "Server error" };
  }
}
