"use strict";

/**
 * Covenant Systems AI: static site + contact endpoint.
 * Zero dependencies. Serves the site and accepts POST /api/contact,
 * which relays the message to Resend. The API key lives only in the
 * RESEND_API_KEY environment variable, never in the repo.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

// Match the port the previous nginx container used (80), so Railway's existing
// routing reaches us. Railway's PORT variable, if set, still takes precedence.
const PORT = process.env.PORT || 80;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_TO = process.env.CONTACT_TO || "j@covenantsystems.ai";
const CONTACT_FROM =
  process.env.CONTACT_FROM || "Covenant Systems AI <noreply@covenantsystems.ai>";

// Allowlist of public files. Anything not listed returns 404, which also
// keeps server.js, package.json, and the Dockerfile from ever being served.
const PUBLIC = {
  "/": { file: "index.html", type: "text/html; charset=utf-8", cache: 300 },
  "/index.html": { file: "index.html", type: "text/html; charset=utf-8", cache: 300 },
  "/privacy.html": { file: "privacy.html", type: "text/html; charset=utf-8", cache: 300 },
  "/terms.html": { file: "terms.html", type: "text/html; charset=utf-8", cache: 300 },
  "/robots.txt": { file: "robots.txt", type: "text/plain; charset=utf-8", cache: 300 },
  "/j-devere-cooley.jpg": { file: "j-devere-cooley.jpg", type: "image/jpeg", cache: 86400 },
};

// Light in-memory rate limit: at most 5 submissions per IP per 10 minutes.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 5;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function validEmail(s) {
  return typeof s === "string" && s.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function sendJson(res, code, obj) {
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(obj));
}

function handleContact(req, res) {
  if (!RESEND_API_KEY) {
    return sendJson(res, 500, { ok: false, error: "Email is not configured yet." });
  }
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";
  if (rateLimited(ip)) {
    return sendJson(res, 429, { ok: false, error: "Too many messages. Please try again later." });
  }

  let raw = "";
  let tooBig = false;
  req.on("data", (chunk) => {
    raw += chunk;
    if (raw.length > 12000) {
      tooBig = true;
      req.destroy();
    }
  });
  req.on("end", async () => {
    if (tooBig) return;
    let data;
    try {
      data = JSON.parse(raw || "{}");
    } catch (e) {
      return sendJson(res, 400, { ok: false, error: "Invalid request." });
    }

    // Honeypot: real visitors never fill this. Accept silently so bots get no signal.
    if (data.website) return sendJson(res, 200, { ok: true });

    const name = (data.name || "").toString().trim();
    const email = (data.email || "").toString().trim();
    const company = (data.company || "").toString().trim();
    const message = (data.message || "").toString().trim();

    if (!name || name.length > 120)
      return sendJson(res, 400, { ok: false, error: "Please enter your name." });
    if (!validEmail(email))
      return sendJson(res, 400, { ok: false, error: "Please enter a valid email." });
    if (company.length > 160)
      return sendJson(res, 400, { ok: false, error: "Company name is too long." });
    if (!message || message.length > 4000)
      return sendJson(res, 400, { ok: false, error: "Please enter a message." });

    const subject = `New inquiry from ${name}${company ? " (" + company + ")" : ""}`;
    const text =
      `Name: ${name}\nEmail: ${email}\nCompany: ${company || "(not given)"}\n\n${message}`;
    const html =
      `<p><strong>Name:</strong> ${esc(name)}</p>` +
      `<p><strong>Email:</strong> ${esc(email)}</p>` +
      `<p><strong>Company:</strong> ${esc(company || "(not given)")}</p>` +
      `<p><strong>Message:</strong></p><p>${esc(message).replace(/\n/g, "<br>")}</p>`;

    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: CONTACT_FROM,
          to: [CONTACT_TO],
          reply_to: email,
          subject: subject,
          text: text,
          html: html,
        }),
      });
      if (!r.ok) {
        const detail = await r.text().catch(() => "");
        console.error("Resend error", r.status, detail);
        return sendJson(res, 502, {
          ok: false,
          error: "Could not send right now. Please email j@covenantsystems.ai directly.",
        });
      }
      return sendJson(res, 200, { ok: true });
    } catch (err) {
      console.error("Resend request failed", err);
      return sendJson(res, 502, {
        ok: false,
        error: "Could not send right now. Please email j@covenantsystems.ai directly.",
      });
    }
  });
}

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];

  if (req.method === "POST" && url === "/api/contact") {
    return handleContact(req, res);
  }

  if (req.method === "GET" || req.method === "HEAD") {
    const entry = PUBLIC[url];
    if (entry) {
      return fs.readFile(path.join(__dirname, entry.file), (err, buf) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          return res.end("Not found");
        }
        res.writeHead(200, {
          "Content-Type": entry.type,
          "Cache-Control": `public, max-age=${entry.cache}`,
        });
        res.end(req.method === "HEAD" ? undefined : buf);
      });
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Not found");
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method not allowed");
});

process.on("uncaughtException", (err) => console.error("uncaughtException", err));
process.on("unhandledRejection", (err) => console.error("unhandledRejection", err));

server.listen(PORT, "0.0.0.0", () =>
  console.log(`Covenant Systems site listening on 0.0.0.0:${PORT}`)
);
