const catalogRepository = require("../repositories/CatalogRepository");

class CatalogController {
  static searchProducts(req, res) {
    const query = req.query.q;
    const products = catalogRepository.queryCatalog(query);
    return res.json(products);
  }
}

module.exports = CatalogController;
