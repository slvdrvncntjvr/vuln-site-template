function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

function layout(title, content, opts = {}) {
  const { user, cartCount = 0 } = opts;
  const staffLink =
    user && user.role === "ADMINISTRATOR"
      ? `<a href="/staff">Staff</a>`
      : "";
  const authLinks = user
    ? `<a href="/account">Account</a><a href="/logout">Logout</a>${staffLink}`
    : `<a href="/login">Sign in</a>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} — Acme Shop</title>
  <style>
    :root {
      --bg: #0f1419;
      --surface: #1a2332;
      --surface-2: #243044;
      --border: #2d3a4f;
      --text: #eef2f7;
      --muted: #8b9cb3;
      --accent: #3b82f6;
      --accent-dim: #2563eb;
      --green: #22c55e;
      --gold: #eab308;
      --red: #ef4444;
      --radius: 10px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      background: linear-gradient(180deg, #0f1419 0%, #121820 100%);
      color: var(--text);
      line-height: 1.55;
      min-height: 100vh;
    }
    a { color: var(--accent); }
    .topbar {
      background: rgba(26, 35, 50, 0.95);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(8px);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .topbar-inner, .container {
      max-width: 1080px;
      margin: 0 auto;
      padding: 0 1.25rem;
    }
    .topbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 3.5rem;
      gap: 1rem;
    }
    .brand {
      font-weight: 800;
      font-size: 1.15rem;
      color: var(--text);
      text-decoration: none;
      letter-spacing: -0.02em;
    }
    .brand span { color: var(--accent); }
    .nav {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }
    .nav a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .nav a:hover { color: var(--text); }
    .cart-pill {
      background: var(--surface-2);
      border: 1px solid var(--border);
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.85rem;
    }
    .container { padding-top: 2rem; padding-bottom: 3rem; }
    .hero {
      text-align: center;
      margin-bottom: 2rem;
    }
    .hero h1 {
      font-size: clamp(1.75rem, 4vw, 2.35rem);
      letter-spacing: -0.03em;
      margin-bottom: 0.35rem;
    }
    .hero p { color: var(--muted); max-width: 36rem; margin: 0 auto; }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.25rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.25rem;
    }
    .product-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .product-card h3 { font-size: 1.05rem; margin: 0.5rem 0; }
    .product-card p {
      color: var(--muted);
      font-size: 0.88rem;
      flex: 1;
      margin-bottom: 1rem;
    }
    .price { font-weight: 700; color: var(--gold); font-size: 1.1rem; }
    .badge {
      display: inline-block;
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--muted);
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
    }
    .btn {
      display: inline-block;
      background: var(--accent);
      color: white;
      border: none;
      padding: 0.55rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
    }
    .btn:hover { background: var(--accent-dim); }
    .btn-secondary {
      background: var(--surface-2);
      color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-block { width: 100%; }
    .form-row { margin-bottom: 1rem; }
    .form-row label {
      display: block;
      font-size: 0.85rem;
      color: var(--muted);
      margin-bottom: 0.35rem;
    }
    .input {
      width: 100%;
      padding: 0.6rem 0.75rem;
      background: #0c1018;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font: inherit;
    }
    .input:focus {
      outline: 2px solid rgba(59, 130, 246, 0.45);
      border-color: var(--accent);
    }
    .alert {
      padding: 0.85rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.92rem;
    }
    .alert-error { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); color: #fca5a5; }
    .alert-success { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.35); color: #86efac; }
    .alert-info { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); color: #93c5fd; }
    table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
    th, td { padding: 0.65rem 0.5rem; border-bottom: 1px solid var(--border); text-align: left; }
    th { color: var(--muted); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; }
    pre {
      background: #0c1018;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;
      font-size: 0.82rem;
      color: #a5f3b0;
    }
    .split { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: end; }
    .footer {
      text-align: center;
      color: var(--muted);
      font-size: 0.8rem;
      padding: 2rem 1rem 0;
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="/"><span>Acme</span> Shop</a>
      <nav class="nav">
        <a href="/">Catalog</a>
        <a href="/cart" class="cart-pill">Cart (${cartCount})</a>
        <a href="/help">Help</a>
        ${authLinks}
      </nav>
    </div>
  </header>
  <main class="container">
    ${content}
    <div class="footer">© Acme Corporation — Quality gadgets since 1928</div>
  </main>
</body>
</html>`;
}

module.exports = { esc, money, layout };
