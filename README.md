# 🚀 GitSense.AI: Autonomous Commit Analyzer & Webhook Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Discord Webhooks](https://img.shields.io/badge/Discord-Webhooks-5865F2?logo=discord)](https://discord.com/)

GitSense.AI is a self-hosted, offline, Zero-Cost AI alternative agent that listens to GitHub pushes, categorizes code changes using a high-speed NLP Rule-Based Engine, and proactively ensures development teams never lose documentation context. 

If a backend or frontend team pushes a **Major Feature** without subsequently updating the repository's `README.md`, GitSense.AI instantly fires a richly formatted alert to your team's Discord server or Email inbox, summarizing the exact commits and pinging the team to document their changes.

---

## ✨ Core Features

*   **⚡ Zero-Latency Analysis**: Operates completely offline without expensive API calls (No Claude, OpenAI, or SaaS subscriptions required).
*   **🧠 Semantic Categorization Engine**: Native pipeline that parses commit messages and instantly slots them into 6 major DevOps templates:
    *   🚀 Feature Enhancements
    *   🐛 Bug Fixes
    *   🔒 Security Patches
    *   ♻️ Refactoring & Optimizations
    *   📦 Dependency Updates
    *   📝 Documentation Adjustments
*   **🚨 Smart Documentation Alerts**: Cross-references categorized "Feature" pushes with Git diffs to see if the `README.md` was modified. If missed, it blasts an alert.
*   **🔔 Frictionless Integrations**: Out-of-the-box support for Discord Webhooks (no bot tokens needed) and Nodemailer (SMTP/Gmail).
*   **🌍 Tunnel-Ready**: Designed to be exposed securely via Cloudflare (`cloudflared`) or Localtunnel.

---

## 🛠️ How It Works (The Lifecycle)

1.  **The Trigger**: A developer runs `git push` on your repository.
2.  **The Intercept**: GitHub fires a JSON Webhook payload across the internet to your Cloudflare Tunnel.
3.  **The Verification**: GitSense.AI intercepts the payload, verifying the SHA-256 HMAC signature using your secret key.
4.  **The Engine**: Discards branches/deleted commits and pipes the raw commit messages into `analyzerService.js`.
5.  **The Verdict**: The Agent determines the category. If `Features > 0` AND the `readmeModified` flag is `false`, it builds an alert packet.
6.  **The Dispatch**: `notificationService.js` routes the beautifully formatted markdown packet to your configured Discord Channel and/or Email.

---

## 💻 Tech Stack

*   **Runtime:** Node.js, Express.js,Python
*   **Network & Security:** Crypto (HMAC SHA-256 for Webhook signature verification)
*   **Git Operations:** GitHub Webhooks API, `@octokit/rest`
*   **Notification Layer:** Discord REST Webhooks, `nodemailer` (SMTP)
*   **Tunneling (Dev):** Cloudflare (`cloudflared`)
*   **Model Context Protocol**

---

## 🚀 Quick Start Guide

### 1. Installation
Clone the repository and install the required packages:

```bash
git clone https://github.com/YOUR_USERNAME/mcp-github-agent.git
cd mcp-github-agent
npm install
```

### 2. Configuration
Create your environment file:
```bash
cp .env.example .env
```
Populate `.env` with your secure credentials:
*   `GITHUB_WEBHOOK_SECRET`: A secure phrase matching your GitHub config.
*   `DISCORD_WEBHOOK_URL`: (Optional) Your Discord channel webhook.
*   `EMAIL_USER` / `EMAIL_PASS`: (Optional) Nodemailer/Gmail App Passwords.

### 3. Run the Agent Locally
Start the primary Express server:
```bash
npm start
```

### 4. Create the Webhook Tunnel
In a new terminal window, expose your localhost securely:
```bash
cloudflared tunnel --url http://localhost:3000
```
Copy the generated `https://*.trycloudflare.com` URL.

### 5. Connect to GitHub
1.  Navigate to your GitHub Repository -> **Settings** -> **Webhooks** -> **Add Webhook**.
2.  **Payload URL**: `<YOUR_CLOUDFLARE_URL>/api/webhook`
3.  **Content type**: `application/json`
4.  **Secret**: Your `GITHUB_WEBHOOK_SECRET`.
5.  **Events**: Just the `push` event.

---

## 📋 Example Discord Alert

```markdown
🚨 Documentation Alert: New Features in DevWidSiddxx/frontend-app
A team member pushed to main without updating the README.

Here's what was merged (Auto-Categorized):

📊 **Commit Analysis Report** 📊

🚀 **Feature Enhancement**:
  - feat: implement new secure login gateway
  - add: stripe payment processing
```
