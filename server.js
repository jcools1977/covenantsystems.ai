"use strict";

/**
 * Covenant Systems AI: static site with a shared HireNorman acquisition path.
 * Zero dependencies. The retired contact endpoint returns 410 without
 * collecting information or sending email.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

// The previous nginx container listened on port 80, which is what Railway's
// proxy for this service routes to. Node honors Railway's injected PORT (a
// different value), so we bind BOTH 80 and PORT and answer on whichever one
// Railway actually forwards to.
const PORTS = Array.from(new Set([80, Number(process.env.PORT)].filter(Boolean)));
// Allowlist of public files. Anything not listed returns 404, which also
// keeps server.js, package.json, and the Dockerfile from ever being served.
const PUBLIC = {
  "/neural-background.css": { file: "neural-background.css", type: "text/css; charset=utf-8", cache: 300 },
  "/neural-network.svg": { file: "neural-network.svg", type: "image/svg+xml", cache: 300 },
  "/sitemap.xml": { file: "sitemap.xml", type: "application/xml; charset=utf-8", cache: 300 },
  "/llms.txt": { file: "llms.txt", type: "text/plain; charset=utf-8", cache: 300 },
  "/site.json": { file: "site.json", type: "application/json; charset=utf-8", cache: 300 },
  "/index.md": { file: "index.md", type: "text/markdown; charset=utf-8", cache: 300 },

  "/referral.js": { file: "referral.js", type: "text/javascript; charset=utf-8", cache: 300 },
  "/": { file: "index.html", type: "text/html; charset=utf-8", cache: 300 },
  "/index.html": { file: "index.html", type: "text/html; charset=utf-8", cache: 300 },
  "/privacy.html": { file: "privacy.html", type: "text/html; charset=utf-8", cache: 300 },
  "/terms.html": { file: "terms.html", type: "text/html; charset=utf-8", cache: 300 },
  "/robots.txt": { file: "robots.txt", type: "text/plain; charset=utf-8", cache: 300 },
  "/j-devere-cooley.jpg": { file: "j-devere-cooley.jpg", type: "image/jpeg", cache: 86400 },
  "/site.css": { file: "site.css", type: "text/css; charset=utf-8", cache: 300 },
  "/covenant-logo.svg": { file: "covenant-logo.svg", type: "image/svg+xml", cache: 86400 },
  "/covenant-mark.svg": { file: "covenant-mark.svg", type: "image/svg+xml", cache: 86400 },
  "/covenant-lockup.svg": { file: "covenant-lockup.svg", type: "image/svg+xml", cache: 86400 },
  "/an2b-logo.svg": { file: "an2b-logo.svg", type: "image/svg+xml", cache: 86400 },
  "/norman-logo.svg": { file: "norman-logo.svg", type: "image/svg+xml", cache: 86400 },
  "/og-image.png": { file: "og-image.png", type: "image/png", cache: 86400 },
  "/favicon.svg": { file: "favicon.svg", type: "image/svg+xml", cache: 86400 },
  "/favicon.png": { file: "favicon.png", type: "image/png", cache: 86400 },
  "/favicon.ico": { file: "favicon.png", type: "image/png", cache: 86400 },
  "/apple-touch-icon.png": { file: "apple-touch-icon.png", type: "image/png", cache: 86400 },
};

function sendJson(res, code, obj) {
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(obj));
}

function requestHandler(req, res) {
  const url = req.url.split("?")[0];

  if (req.method === "POST" && url === "/api/contact") {
    return sendJson(res, 410, { ok: false, error: "Please start your interview at HireNorman.", url: "https://hirenorman.com/interview?source=covenant&campaign=business-waitlist-2026" });
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
}

process.on("uncaughtException", (err) => console.error("uncaughtException", err));
process.on("unhandledRejection", (err) => console.error("unhandledRejection", err));

PORTS.forEach((p) => {
  const s = http.createServer(requestHandler);
  s.on("error", (err) => console.error(`listen error on port ${p}: ${err.message}`));
  s.listen(p, "0.0.0.0", () =>
    console.log(`Covenant Systems site listening on 0.0.0.0:${p}`)
  );
});
