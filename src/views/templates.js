const renderLayout = require("./layout");

class Views {
  static catalogPage(query, products) {
    const content = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="font-size: 2.2rem; color: var(--accent); margin-bottom: 0.5rem;">Acme Corporation Storefront</h1>
        <p style="color: var(--muted);">Quality anvils, rockets, and gadgets delivered worldwide.</p>
      </div>

      <div class="card">
        <form action="/" method="GET" style="display: flex; gap: 0.5rem;">
          <input class="form-input" name="q" value="${query || ""}" placeholder="Search product catalog..." style="margin-bottom: 0;" />
          <button type="submit" class="btn">Search</button>
        </form>
      </div>

      <h2 style="margin-bottom: 1rem;">Product Catalog</h2>
      <div class="grid-3">
        ${products
          .map(
            (p) => `
          <div class="card" style="margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span class="badge">${p.tag || "Available"}</span>
              <span style="font-weight: 700; color: var(--gold);">$${p.price}</span>
            </div>
            <h3 style="margin-bottom: 0.5rem;">${p.name}</h3>
            <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">${p.desc}</p>
            ${p.secretFlag ? `<pre>${p.secretFlag}</pre>` : '<button class="btn btn-secondary" style="width: 100%;">Add to Cart</button>'}
          </div>
        `
          )
          .join("")}
      </div>
    `;
    return renderLayout("Product Storefront", content);
  }

  static profilePage(requestingId, targetId, profileData, errorMsg) {
    const content = `
      <h1>Customer Profile Studio</h1>
      <p style="color: var(--muted); margin-bottom: 1.5rem;">View and manage account credentials.</p>

      <div class="card">
        <h3>Session Authorization Simulator</h3>
        <form action="/profile" method="GET" style="margin-top: 1rem; display: flex; gap: 1rem; flex-wrap: wrap;">
          <div>
            <label style="font-size: 0.85rem; color: var(--muted);">Requesting Session (X-User-Id):</label>
            <select name="user_id" class="form-input" style="width: 180px; margin-top: 0.2rem;">
              <option value="1" ${requestingId === "1" ? "selected" : ""}>User 1 (Alice Admin)</option>
              <option value="2" ${requestingId === "2" ? "selected" : ""}>User 2 (Bob Shopper)</option>
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

      ${errorMsg ? `<div class="card" style="border-color: var(--red); color: var(--red);">${errorMsg}</div>` : ""}

      ${
        profileData
          ? `
        <div class="card">
          <h2 style="margin-bottom: 0.5rem;">${profileData.name}</h2>
          <p style="color: var(--muted); margin-bottom: 1rem;">${profileData.bio}</p>
          ${profileData.secret ? `<pre>SECRET_VAULT:\n${profileData.secret}</pre>` : ""}
        </div>
      `
          : ""
      }
    `;
    return renderLayout("User Profile", content);
  }

  static docsPage(filePath, fileContent) {
    const content = `
      <h1>Documentation Portal</h1>
      <p style="color: var(--muted); margin-bottom: 1.5rem;">Browse product specifications and service documentation.</p>

      <div class="card">
        <form action="/docs" method="GET" style="display: flex; gap: 0.5rem;">
          <input class="form-input" name="path" value="${filePath}" placeholder="Enter file path..." style="margin-bottom: 0;" />
          <button type="submit" class="btn">Read File</button>
        </form>
      </div>

      <div class="card">
        <h3 style="margin-bottom: 0.5rem;">Document Stream: ${filePath}</h3>
        <pre>${fileContent}</pre>
      </div>
    `;
    return renderLayout("Documentation Hub", content);
  }

  static fetchPage(targetUrl, fetchedText) {
    const content = `
      <h1>External Link Proxy Tool</h1>
      <p style="color: var(--muted); margin-bottom: 1.5rem;">Preview remote websites and microservices.</p>

      <div class="card">
        <form action="/fetch-preview" method="GET" style="display: flex; gap: 0.5rem;">
          <input class="form-input" name="url" value="${targetUrl}" placeholder="e.g. https://example.com" style="margin-bottom: 0;" />
          <button type="submit" class="btn">Fetch Resource</button>
        </form>
      </div>

      ${targetUrl ? `<div class="card"><h3>Resource Output:</h3><pre>${fetchedText}</pre></div>` : ""}
    `;
    return renderLayout("Link Proxy", content);
  }

  static pingPage(host) {
    const content = `
      <h1>Network Diagnostic Console</h1>
      <p style="color: var(--muted); margin-bottom: 1.5rem;">Verify system connectivity and latency.</p>

      <div class="card">
        <form action="/ping-utility" method="GET" style="display: flex; gap: 0.5rem;">
          <input class="form-input" name="host" value="${host}" placeholder="e.g. 127.0.0.1" style="margin-bottom: 0;" />
          <button type="submit" class="btn">Ping Host</button>
        </form>
      </div>

      ${
        host
          ? `<div class="card"><h3>Diagnostic Stream:</h3><iframe src="/api/ping?host=${encodeURIComponent(
              host
            )}" style="width:100%; height:160px; border:none; background:#010409; color:#7ee787; border-radius:6px;"></iframe></div>`
          : ""
      }
    `;
    return renderLayout("Ping Utility", content);
  }

  static adminPage() {
    const content = `
      <h1>Admin Management Vault</h1>
      <p style="color: var(--muted); margin-bottom: 1.5rem;">Verify management session tokens and secret keys.</p>

      <div class="card">
        <h3>Token Verification</h3>
        <form id="adminForm" style="margin-top: 1rem;">
          <label style="font-size: 0.85rem; color: var(--muted);">JWT Bearer Token:</label>
          <input id="tokenInput" class="form-input" placeholder="Paste JWT token..." style="margin-top: 0.2rem;" />
          <button type="button" class="btn" onclick="submitToken()">Authenticate Token</button>
        </form>
      </div>

      <div id="resultCard" class="card" style="display: none;">
        <h3>Response Payload:</h3>
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
    return renderLayout("Admin Portal", content);
  }
}

module.exports = Views;
