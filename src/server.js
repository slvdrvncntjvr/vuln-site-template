const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;
const GM_TOKEN = process.env.GM_TOKEN || "gm-token-ctf-2026-xK9mP2nQwRvJ4hL7";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const flagsPath = path.join(__dirname, "flags.json");
let flags = {};
try {
  flags = JSON.parse(fs.readFileSync(flagsPath, "utf8"));
} catch (e) {
  console.error("Configuration error loading storage");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value || "").digest("hex");
}

// ---------------------------------------------------------------------------
// Anti-Cheat GM Verify Endpoint & Internal Flag Helper
// ---------------------------------------------------------------------------

app.post("/__gm/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token || token !== GM_TOKEN) {
    return res.status(401).json({ error: "Unauthorized request" });
  }

  const { vulnId, hash } = req.body;
  if (!vulnId || !hash) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const currentFlag = flags[vulnId];
  if (!currentFlag) {
    return res.json({ match: false });
  }

  const expectedHash = sha256(currentFlag);
  return res.json({ match: expectedHash === hash });
});

app.get("/__gm/flag", (req, res) => {
  res.send(`INTERNAL_SERVICE_FLAG:${flags.SSRF}`);
});

// ---------------------------------------------------------------------------
// Shared Layout Helper for Real E-Commerce Web Pages
// ---------------------------------------------------------------------------

function renderPage(title, bodyContent) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} — Acme Shop</title>
      <style>
        :root {
          --bg: #0d1117;
          --card: #161b22;
          --border: #30363d;
          --accent: #2f81f7;
          --text: #e6edf3;
          --muted: #8b949e;
          --green: #238636;
          --gold: #d29922;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); line-height: 1.5; }
        .nav { background: var(--card); border-bottom: 1px solid var(--border); padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; }
        .brand { font-size: 1.25rem; font-weight: 700; color: var(--accent); text-decoration: none; display: flex; align-items: center; gap: 0.5rem; }
        .nav-links { display: flex; gap: 1.25rem; }
        .nav-links a { color: var(--text); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.15s; }
        .nav-links a:hover { color: var(--accent); }
        .container { max-width: 1000px; margin: 2rem auto; padding: 0 1rem; }
        .card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
        .btn { background: var(--accent); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
        .btn:hover { opacity: 0.9; }
        .btn-secondary { background: #21262d; color: var(--text); border: 1px solid var(--border); }
        .form-input { width: 100%; padding: 0.6rem 0.8rem; background: #010409; border: 1px solid var(--border); border-radius: 6px; color: var(--text); margin-bottom: 1rem; font-family: inherit; }
        .badge { background: var(--green); color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
        pre, code { background: #010409; padding: 0.8rem; border-radius: 6px; color: #7ee787; font-family: monospace; overflow-x: auto; }
      </style>
    </head>
    <body>
      <nav class="nav">
        <a href="/" class="brand">📦 Acme Shop</a>
        <div class="nav-links">
          <a href="/">Catalog</a>
          <a href="/profile">Profile</a>
          <a href="/docs">Docs</a>
          <a href="/fetch-preview">Link Proxy</a>
          <a href="/ping-utility">Ping Diagnostic</a>
          <a href="/admin-portal">Admin Portal</a>
        </div>
      </nav>
      <div class="container">
        ${bodyContent}
      </div>
    </body>
    </html>
  `;
}

// ---------------------------------------------------------------------------
// Storefront Pages (HTML)
// ---------------------------------------------------------------------------

// 1. Homepage & Catalog Search
app.get("/", (req, res) => {
  const query = (req.query.q || "").toString();
  let searchResults = [
    { id: 1, name: "Acme Anvil 5000", desc: "Heavy-duty steel anvil for all cartoon needs.", price: 99.99, tag: "Best Seller" },
    { id: 2, name: "Acme Rocket Boots", desc: "High-thrust boots with solid fuel boosters.", price: 499.99, tag: "New" },
    { id: 3, name: "Acme Portable Hole", desc: "Instant passage through solid objects.", price: 299.99, tag: "Popular" },
  ];

  if (query.includes("' OR '1'='1") || query.includes("' OR 1=1")) {
    searchResults.push({
      id: 99,
      name: "Confidential R&D Blueprint",
      desc: "Top Secret Project Document: " + flags.SQLI,
      price: 0,
      tag: "RESTRICTED",
    });
  }

  const content = `
    <div style="text-align: center; margin-bottom: 2rem;">
      <h1 style="font-size: 2.2rem; color: var(--accent); margin-bottom: 0.5rem;">Acme Corporation Storefront</h1>
      <p style="color: var(--muted);">Quality anvils, rockets, and gadgets delivered worldwide.</p>
    </div>

    <div class="card">
      <form action="/" method="GET" style="display: flex; gap: 0.5rem;">
        <input class="form-input" name="q" value="${query}" placeholder="Search products..." style="margin-bottom: 0;" />
        <button type="submit" class="btn">Search</button>
      </form>
    </div>

    <h2 style="margin-bottom: 1rem;">Product Catalog</h2>
    <div class="grid-3">
      ${searchResults
        .map(
          (p) => `
        <div class="card" style="margin-bottom: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span class="badge">${p.tag}</span>
            <span style="font-weight: 700; color: var(--gold);">$${p.price}</span>
          </div>
          <h3 style="margin-bottom: 0.5rem;">${p.name}</h3>
          <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">${p.desc}</p>
          <button class="btn btn-secondary" style="width: 100%;">Add to Cart</button>
        </div>
      `
        )
        .join("")}
    </div>
  `;
  res.send(renderPage("Product Storefront", content));
});

// 2. Interactive User Profile Page
app.get("/profile", (req, res) => {
  const requestingId = (req.query.user_id || "1").toString();
  const targetId = (req.query.target_id || requestingId).toString();

  let profileData = { name: "Guest User", bio: "Please log in." };
  let errorMsg = "";

  if (targetId === "1" && requestingId === "2") {
    profileData = {
      name: "Alice Admin",
      bio: "System Administrator & Key Vault Owner",
      secret: flags.IDOR,
    };
  } else if (requestingId === targetId) {
    profileData = { name: `User #${targetId}`, bio: "Verified Customer" };
  } else {
    errorMsg = "Access Denied: You do not have permission to view this profile.";
  }

  const content = `
    <h1>Customer Profile Portal</h1>
    <p style="color: var(--muted); margin-bottom: 1.5rem;">View and manage account settings.</p>

    <div class="card">
      <h3>Simulate Session Header</h3>
      <form action="/profile" method="GET" style="margin-top: 1rem; display: flex; gap: 1rem; flex-wrap: wrap;">
        <div>
          <label style="font-size: 0.85rem; color: var(--muted);">Simulated Session (X-User-Id):</label>
          <select name="user_id" class="form-input" style="width: 180px; margin-top: 0.2rem;">
            <option value="1" ${requestingId === "1" ? "selected" : ""}>User 1 (Alice)</option>
            <option value="2" ${requestingId === "2" ? "selected" : ""}>User 2 (Bob)</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.85rem; color: var(--muted);">Target Profile ID:</label>
          <input name="target_id" value="${targetId}" class="form-input" style="width: 120px; margin-top: 0.2rem;" />
        </div>
        <div style="align-self: flex-end; margin-bottom: 1rem;">
          <button type="submit" class="btn">Load Profile</button>
        </div>
      </form>
    </div>

    ${errorMsg ? `<div class="card" style="border-color: #f85149; color: #f85149;">${errorMsg}</div>` : ""}

    <div class="card">
      <h2 style="margin-bottom: 0.5rem;">${profileData.name}</h2>
      <p style="color: var(--muted); margin-bottom: 1rem;">${profileData.bio}</p>
      ${profileData.secret ? `<pre>SECRET_DATA:\n${profileData.secret}</pre>` : ""}
    </div>
  `;
  res.send(renderPage("User Profile", content));
});

// 3. Documentation Viewer Page
app.get("/docs", (req, res) => {
  const filePath = (req.query.path || "readme.txt").toString();
  let fileContent = "";

  if (filePath.includes("flag.txt")) {
    fileContent = `FILE CONTENT (flag.txt):\n${flags.LFI}`;
  } else if (filePath === "readme.txt") {
    fileContent = "Acme Shop Documentation v1.0\nAll systems operational.";
  } else {
    fileContent = "Error: Requested document not found.";
  }

  const content = `
    <h1>Documentation Hub</h1>
    <p style="color: var(--muted); margin-bottom: 1.5rem;">Access user guides and technical documentation.</p>

    <div class="card">
      <form action="/docs" method="GET" style="display: flex; gap: 0.5rem;">
        <input class="form-input" name="path" value="${filePath}" placeholder="Enter file path..." style="margin-bottom: 0;" />
        <button type="submit" class="btn">Read Document</button>
      </form>
    </div>

    <div class="card">
      <h3 style="margin-bottom: 0.5rem;">Document Content: ${filePath}</h3>
      <pre>${fileContent}</pre>
    </div>
  `;
  res.send(renderPage("Docs Hub", content));
});

// 4. External Link Proxy Tool Page
app.get("/fetch-preview", async (req, res) => {
  const targetUrl = (req.query.url || "").toString();
  let fetchedText = "";

  if (targetUrl) {
    try {
      const response = await fetch(targetUrl);
      fetchedText = await response.text();
    } catch (err) {
      fetchedText = "Fetch failed: " + err.message;
    }
  }

  const content = `
    <h1>External Link Preview Tool</h1>
    <p style="color: var(--muted); margin-bottom: 1.5rem;">Preview external websites or web resources.</p>

    <div class="card">
      <form action="/fetch-preview" method="GET" style="display: flex; gap: 0.5rem;">
        <input class="form-input" name="url" value="${targetUrl}" placeholder="e.g. https://example.com" style="margin-bottom: 0;" />
        <button type="submit" class="btn">Fetch Preview</button>
      </form>
    </div>

    ${targetUrl ? `<div class="card"><h3>Preview Response:</h3><pre>${fetchedText}</pre></div>` : ""}
  `;
  res.send(renderPage("Link Proxy", content));
});

// 5. Network Diagnostic Console Page
app.get("/ping-utility", (req, res) => {
  const host = (req.query.host || "").toString();

  const content = `
    <h1>Network Diagnostic Console</h1>
    <p style="color: var(--muted); margin-bottom: 1.5rem;">Test network latency to remote hosts.</p>

    <div class="card">
      <form action="/ping-utility" method="GET" style="display: flex; gap: 0.5rem;">
        <input class="form-input" name="host" value="${host}" placeholder="e.g. 127.0.0.1" style="margin-bottom: 0;" />
        <button type="submit" class="btn">Ping Host</button>
      </form>
    </div>

    ${
      host
        ? `<div class="card"><h3>Ping Output:</h3><iframe src="/api/ping?host=${encodeURIComponent(
            host
          )}" style="width:100%; height:150px; border:none; background:#010409; color:#7ee787; border-radius:6px;"></iframe></div>`
        : ""
    }
  `;
  res.send(renderPage("Ping Utility", content));
});

// 6. Admin Management Gateway Portal
app.get("/admin-portal", (req, res) => {
  const content = `
    <h1>Admin Gateway Portal</h1>
    <p style="color: var(--muted); margin-bottom: 1.5rem;">Management authentication and secret vault access.</p>

    <div class="card">
      <h3>Admin Token Login</h3>
      <form id="adminForm" style="margin-top: 1rem;">
        <label style="font-size: 0.85rem; color: var(--muted);">JWT Bearer Token:</label>
        <input id="tokenInput" class="form-input" placeholder="Paste JWT token..." style="margin-top: 0.2rem;" />
        <button type="button" class="btn" onclick="submitToken()">Validate Token</button>
      </form>
    </div>

    <div id="resultCard" class="card" style="display: none;">
      <h3>Response:</h3>
      <pre id="resultText"></pre>
    </div>

    <script>
      async function submitToken() {
        const token = document.getElementById("tokenInput").value;
        const res = await fetch("/api/admin/secret", {
          headers: { "Authorization": "Bearer " + token }
        });
        const text = await res.text();
        document.getElementById("resultCard").style.display = "block";
        document.getElementById("resultText").innerText = text;
      }
    </script>
  `;
  res.send(renderPage("Admin Portal", content));
});

// ---------------------------------------------------------------------------
// Raw JSON & Text API Endpoints (Used by Grader & Exploits)
// ---------------------------------------------------------------------------

// 1. User Profile API
app.get("/api/users/:id/profile", (req, res) => {
  const targetUserId = req.params.id;
  const requestingUserId = req.headers["x-user-id"];

  if (targetUserId === "1" && requestingUserId === "2") {
    return res.json({
      id: 1,
      name: "Alice Admin",
      bio: "System Administrator",
      secret: flags.IDOR,
    });
  }

  if (requestingUserId === targetUserId) {
    return res.json({ id: targetUserId, name: `User ${targetUserId}`, bio: "Regular customer" });
  }

  return res.status(403).json({ error: "Access denied" });
});

// 2. Fetch Utility API
app.get("/api/fetch", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: "Missing url parameter" });

  try {
    const response = await fetch(targetUrl);
    const text = await response.text();
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed: " + err.message });
  }
});

// 3. Catalog Search API
app.get("/api/products/search", (req, res) => {
  const query = (req.query.q || "").toString();

  if (query.includes("' OR '1'='1") || query.includes("' OR 1=1")) {
    return res.json([
      { id: 1, name: "Acme Anvil", price: 99.99 },
      { id: 2, name: "Acme Rocket", price: 499.99 },
      { id: 99, name: "Confidential Blueprint", secretFlag: flags.SQLI },
    ]);
  }

  return res.json([
    { id: 1, name: "Acme Anvil", price: 99.99 },
    { id: 2, name: "Acme Rocket", price: 499.99 },
  ]);
});

// 4. File Portal API
app.get("/api/files", (req, res) => {
  const filePath = (req.query.path || "").toString();

  if (filePath.includes("flag.txt")) {
    return res.send(`FILE CONTENT:\n${flags.LFI}`);
  }

  if (filePath === "readme.txt") {
    return res.send("Welcome to Acme Shop documentation.");
  }

  return res.status(404).send("File not found");
});

// 5. Admin Gateway API
app.get("/api/admin/secret", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const parts = token.split(".");
    if (parts.length >= 2) {
      const headerStr = Buffer.from(parts[0], "base64url").toString("utf8");
      const header = JSON.parse(headerStr);

      if (header.alg === "none" || header.alg === "NONE") {
        return res.json({ secret: flags.JWT, message: "Welcome Admin" });
      }
    }
  } catch (e) {
    /* Invalid token format */
  }

  return res.status(403).json({ error: "Invalid token" });
});

// 6. Ping Diagnostic API
app.get("/api/ping", (req, res) => {
  const host = (req.query.host || "").toString();

  if (host.includes(";") || host.includes("cat")) {
    return res.send(`PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\n${flags.CMDINJ}`);
  }

  exec(`ping -c 1 ${host}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(200).send("PING 127.0.0.1: 56 data bytes\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.042 ms");
    }
    res.send(stdout);
  });
});

// Auth login endpoint
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "user" && password === "password") {
    return res.json({ token: "valid-demo-token" });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

app.listen(PORT, () => {
  console.log(`Acme Shop target web application listening on port ${PORT}`);
});
