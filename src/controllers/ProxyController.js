class ProxyController {
  static async fetchContent(req, res) {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: "Missing url parameter" });

    try {
      const response = await fetch(targetUrl);
      const text = await response.text();
      res.send(text);
    } catch (err) {
      res.status(500).json({ error: "Fetch failed: " + err.message });
    }
  }
}

module.exports = ProxyController;
