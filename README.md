# covenantsystems.ai

Site for Covenant Systems AI LLC, the fractional CTO and AI solution
architecture practice of J. DeVere Cooley.

## Structure
- index.html    Landing page (with the contact form)
- privacy.html  Privacy policy
- terms.html    Terms of service
- robots.txt    Crawler rules
- j-devere-cooley.jpg  Founder portrait
- server.js     Zero-dependency Node server: serves the site and the contact endpoint
- package.json  Start script and Node engine
- Dockerfile    node:20-alpine container that runs server.js

## How it runs
A small Node server (server.js) serves the static pages and exposes
`POST /api/contact`. The endpoint validates the submission and relays it
to your inbox through Resend. There are no third-party browser scripts and
no analytics: the only network call leaves the server, not the visitor.

## Environment variables (set in Railway, never in the repo)
- `RESEND_API_KEY`  Required. Your Resend API key.
- `CONTACT_TO`      Optional. Recipient. Defaults to j@covenantsystems.ai.
- `CONTACT_FROM`    Optional. Sender. Defaults to
                    "Covenant Systems AI <noreply@covenantsystems.ai>".
                    Must be an address on a domain verified in Resend.
- `PORT`            Provided automatically by Railway.

## Deploy
Push to the connected branch. Railway rebuilds the Dockerfile and
redeploys. No build step.

## Local preview
`npm start` (or `node server.js`), then open http://localhost:8080.
Without RESEND_API_KEY set, the form returns a "not configured" message;
everything else works.

## Notes
- The contact form is the primary path; a direct mailto link to
  j@covenantsystems.ai remains as a fallback.
- Legal pages are plain-language starting points. Have counsel review.
