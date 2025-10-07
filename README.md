# COMMS System IP Search (GitHub Pages)

Static site for quickly finding COMMS login credentials and IPs by **Vehicle → Equipment**.

## Structure
```
.
├─ index.html
├─ app.js
├─ styles.css
└─ assets/
   └─ data.json
```

## Deploy to GitHub Pages
1. Create a new **public** repo on GitHub (e.g., `comms-ip-search`).
2. Upload all files in this folder, keeping the same structure.
3. In the repo: **Settings → Pages → Branch: `main` / `(root)` → Save**.
4. Your site will appear at `https://<your-account>.github.io/<repo-name>/`.

> `app.js` loads `assets/data.json`. If you move files, keep that relative path intact.
