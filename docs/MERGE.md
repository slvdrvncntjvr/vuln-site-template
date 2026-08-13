# Merging v3 into main

If GitHub shows conflicts when merging `v3-rework` → `main`, **always keep the v3 side** for these files:

| File | Resolution |
|------|------------|
| `.env.example` | Use `FLAG1`…`FLAG6` (not `FLAG_IDOR`, etc.) |
| `src/services/flagService.js` | Use v3 (opaque slots + grader verify map) |
| `src/flags.json` | **Delete** — flags come from env only |
| `src/server.js` | Use v3 stub (`require("./app.js")`) |
| All of `src/routes/`, `src/services/`, `src/store/`, `src/data/` | Use v3 |

Quick rule: if the conflict is **old lab-style code vs new shop**, pick **new shop**.

After merge locally:

```powershell
git checkout main
git merge v3-rework
git push origin main
```

If main on GitHub has commits you don't have locally, pull first:

```powershell
git fetch origin
git checkout main
git pull origin main
git merge v3-rework
```
