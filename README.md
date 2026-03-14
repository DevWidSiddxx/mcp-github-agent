# MCP Agent for Github Feature Detection & Documentation Update

This Agent listens for Github Push events via webhooks, categorizes features/bugs/security using a fast offline rule-based pipeline, and proactively informs the team via Discord Webhooks or Email if the `README.md` wasn't updated. No paid AI subscriptions required!

## Features
- **Express Webhook Server**: Captures payload when a merged PR or branch push occurs on GitHub.
- **Offline Categorization**: Uses keyword analysis to instantly categorize commits into the 6 major software project templates:
  1. Feature Enhancements
  2. Bug Fixes
  3. Security Patches
  4. Refactoring / Optimization
  5. Dependency Updates
  6. Documentation Updates
- **Smart Remediation**:
  - Automatically notifies the team via **Discord Webhook** (No setup/login required).
  - Can alternatively email the team via **Nodemailer** / Gmail.
- **Tunnel Ready**: Built to be immediately hooked into the internet using Cloudflare (`cloudflared`) or Localtunnel.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill the variables. 

### Method 1: The Easiest Option (Discord)
1. In Discord, go to **Server Settings** > **Integrations** > **Webhooks** > **New Webhook**.
2. Copy the URL and paste it into `.env` under `DISCORD_WEBHOOK_URL`.

### Method 2: Email Updates
1. Generate an App Password in your Google Account.
2. Fill out `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_RECEIVER` in your `.env`.

## Running the Agent

Start your server locally on port 3000:
```bash
node index.js
```

In a new terminal, secure an external URL to your local server:

**Option A (Using Cloudflare - Recommended):**
```bash
npm install -g cloudflared
cloudflared tunnel --url http://localhost:3000
```

**Option B (Using Localtunnel):**
```bash
npx localtunnel --port 3000
```

## Github Webhook Setup
1. Go to your Github Repository -> **Settings** -> **Webhooks** -> **Add Webhook**.
2. **Payload URL**: Use the HTTPS tunnel URL printed by cloudflare/localtunnel + `/api/webhook` (e.g. `https://my-tunnel.trycloudflare.com/api/webhook`).
3. **Content type**: `application/json`
4. **Secret**: Include your `GITHUB_WEBHOOK_SECRET` from `.env`.
5. **Events**: Select **Just the push event**.

---
*Built to help your development teams move faster without silently losing feature documentation!*
