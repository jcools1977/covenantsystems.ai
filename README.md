# covenantsystems.ai

Static site for Covenant Systems AI LLC, the fractional CTO and AI solution
architecture practice of J. DeVere Cooley.

## Structure
- index.html    Landing page
- privacy.html  Privacy policy
- terms.html    Terms of service
- robots.txt    Crawler rules
- Dockerfile    nginx:alpine container that serves the repo root

## Deploy
The Dockerfile copies the repo root into nginx. Push to the connected
branch and the existing pipeline rebuilds and redeploys. No build step.

## Notes
- All client contact flows to j@covenantsystems.ai (mailto, no form, no trackers).
- No analytics or third-party scripts. Add your own if/when you want them.
- Legal pages are plain-language starting points. Have counsel review.
