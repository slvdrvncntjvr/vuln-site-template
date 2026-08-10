const fs = require("fs");
const path = require("path");

// Allowed documentation files served from the /docs directory
// Serves files from the /docs directory only (intended)
// The secret.txt file sits one level above this at the project root
const DOCS_ROOT = path.join(__dirname, "../../docs");

class PathSanitizer {
  // Simulates a file portal that joins user input directly to a base path.
  // Intended to only serve files inside /docs/, but path traversal bypasses this.
  static resolveDocumentPath(inputPath) {
    const rawInput = (inputPath || "").toString();

    // Build the full path by joining the docs root with user-supplied input
    // Bug: path.join resolves '..' sequences, allowing traversal outside DOCS_ROOT
    const resolvedPath = path.join(DOCS_ROOT, rawInput);

    try {
      const content = fs.readFileSync(resolvedPath, "utf8");
      return { success: true, filename: rawInput, content };
    } catch (err) {
      return { success: false, error: `Cannot read file: ${rawInput}` };
    }
  }
}

module.exports = PathSanitizer;
