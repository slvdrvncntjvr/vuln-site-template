Welcome to Acme Shop documentation.

Version: 2.0.0
Last Updated: 2026-01-10

Endpoints:
  GET /api/products/search?q=<query>   - Search the product catalog
  GET /api/users/:id/profile           - View a customer profile
  GET /api/admin/secret                - Admin management gateway (requires JWT)
  GET /api/ping?host=<host>            - Network diagnostic ping
  GET /api/fetch?url=<url>             - External resource preview tool
  GET /api/files?path=<path>           - Documentation file viewer
