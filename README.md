# covenantsystems.ai

Site for Covenant Systems AI LLC, the fractional CTO and AI solution
architecture practice of J. DeVere Cooley.

## Structure
- index.html    Landing page with the paid 45-day blueprint and Norman interview links
- privacy.html  Privacy policy
- terms.html    Terms of service
- robots.txt    Crawler rules
- site.css      Shared styles (same layout system as an2b.com, gold palette)
- j-devere-cooley.jpg  Founder portrait
- covenant-logo.svg    Full stacked logo (mark, wordmark, Trust. Walk. Build.)
- covenant-mark.svg    Emblem only (hero)
- covenant-lockup.svg  Emblem and wordmark side by side (nav and footer)
- favicon.svg / favicon.png / apple-touch-icon.png  Icons from the emblem
- og-image.png         Social share card
- an2b-logo.svg        AN2B logo (copied from an2b.com) for the footer links
- norman-logo.svg      Norman. wordmark (from the hirenorman brand kit) for the footer HireNorman link
- server.js     Zero-dependency Node server: serves the site and retires the old contact endpoint
- package.json  Start script and Node engine
- Dockerfile    node:20-alpine container that runs server.js

## How it runs
The small Node server serves static pages. Acquisition links enter HireNorman's existing consent flow; Covenant does not collect a parallel contact record. The retired `POST /api/contact` endpoint returns 410 with the interview URL, without storing or sending the request. No third-party browser scripts or analytics are added.

## Environment
`PORT` is supplied by Railway. The server also retains port 80 for the existing proxy mapping. Legacy Resend/contact variables are no longer read; no credential changes are part of this release.

## Deploy
Push to the connected branch. Railway rebuilds the Dockerfile and
redeploys. No build step.

## Local preview
`PORT=8080 npm start` (or `PORT=8080 node server.js`), then open http://localhost:8080.

## Brand
The logo files are cleaned exports of the Covenant Systems AI vector logo
(Illustrator metadata removed, gold gradients kept). New public files must be
added to the PUBLIC allowlist in server.js or they return 404.

## Notes
- The Norman interview is the primary path; a direct mailto link to
  j@covenantsystems.ai remains as a human-handled alternative.
- Legal pages are plain-language starting points. Have counsel review.

## Acquisition funnel (2026-11-06)
All new website acquisition enters the existing HireNorman consent flow with source=covenant. The old contact form and Resend relay are retired; /api/contact returns 410 with the interview URL. Direct email remains a human-handled alternative, outside the automatic queue. No credentials, customer data, payment, or autonomous outreach are added.
