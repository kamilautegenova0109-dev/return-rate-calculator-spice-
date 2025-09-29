# Return Rate Calculator Widget (React + Vite + Tailwind)

## Quick start
1) Create a Netlify account at https://app.netlify.com
2) Connect this repo (after you upload it to GitHub) OR zip & drag the **dist/** folder after building.
3) Set environment variables for CRM (optional but recommended):
   - CRM_WEBHOOK_URL = https://your-crm-or-zapier-webhook.example
   - CRM_AUTH_BEARER = your-token (optional)

## Local dev
- npm install
- npm run dev

## Build
- npm run build
- Output: dist/

## Netlify function
- /.netlify/functions/lead forwards POSTed leads to your CRM webhook using env vars.
- In App.jsx, the client calls `/.netlify/functions/lead` automatically on form submit.
