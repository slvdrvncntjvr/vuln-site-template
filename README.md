# Acme Shop — Attack/Defend CTF Blue Team Target

Welcome Blue Team Defenders! This repository is your team's target web application.

---

## 🚀 Quick Start (GitHub Codespaces)

1. Click **Code** → **Codespaces** → **Create codespace on main**.
2. Wait for the environment to build. Node.js dependencies and the application will start automatically.
3. Open the **Ports** tab in Codespaces, ensure port `3000` visibility is set to **Public**, and copy your forwarded URL (e.g. `https://your-codespace-xxx.github.dev`).
4. Log into the CTF Platform (`/play`) and submit your repository URL and Codespaces URL under **Submit Target**.

---

## 🛡️ Your Mission

Your application contains **6 planted vulnerabilities**. Your goal during the **Hardening Phase** is to identify and patch these vulnerabilities without breaking legitimate application features.

---

## ⚠️ Anti-Cheat Rules

- Do **NOT** delete `src/flags.json` or modify the internal `/__gm/verify` endpoint.
- The CTF Defense Grader will probe your target URL during judging to verify that flags are intact and functionality remains active.
