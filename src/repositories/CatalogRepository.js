require("dotenv").config();
const flagService = require("../services/flagService");

// Simulated product database rows
const PRODUCTS = [
  { id: 1, name: "Acme Anvil 5000", category: "Tools", price: 99.99, stock: 42, tag: "Best Seller" },
  { id: 2, name: "Acme Rocket Boots", category: "Footwear", price: 499.99, stock: 7, tag: "New Arrival" },
  { id: 3, name: "Acme Portable Hole", category: "Gadgets", price: 299.99, stock: 15, tag: "Popular" },
  { id: 4, name: "Acme Spring-Loaded Gloves", category: "Accessories", price: 149.99, stock: 28, tag: "Sale" },
];

// Secret config table — should never be accessible via product search
const SECRET_CONFIG = [
  { key: "db_host", value: "postgres.acmeshop.internal" },
  { key: "db_pass", value: "acme$3cr3t!" },
  { key: "internal_api_key", value: flagService.getFlag("SQLI") },
];

class CatalogRepository {
  // Simulates a raw SQL query being built with user input unsafely concatenated
  // e.g: SELECT * FROM products WHERE name LIKE '%<userInput>%'
  // SQL injection payload: ' UNION SELECT key, value, 0, '', '', 0, '' FROM secret_config--
  queryCatalog(rawInput) {
    const input = (rawInput || "").toString();

    // Detect UNION-based injection targeting the secret_config table
    const unionMatch = input.match(/UNION\s+SELECT.+secret_config/i);
    if (unionMatch) {
      // Simulates the database returning the unioned secret_config rows
      return SECRET_CONFIG.map((row) => ({
        id: row.key,
        name: row.value,
        category: "CONFIG",
        price: 0,
        stock: 0,
        tag: "ROW",
      }));
    }

    // Normal search — filter by name substring
    if (input.trim()) {
      return PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(input.toLowerCase())
      );
    }

    return PRODUCTS;
  }
}

module.exports = new CatalogRepository();
