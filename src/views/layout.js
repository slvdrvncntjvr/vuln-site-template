module.exports = function renderLayout(title, content) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} — Acme Shop Enterprise</title>
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
          --red: #f85149;
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
        ${content}
      </div>
    </body>
    </html>
  `;
};
