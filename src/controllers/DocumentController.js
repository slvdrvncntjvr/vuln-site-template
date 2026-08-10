const pathSanitizer = require("../utils/PathSanitizer");

class DocumentController {
  static getFile(req, res) {
    const filePath = req.query.path;
    const result = pathSanitizer.resolveDocumentPath(filePath);

    if (result.success) {
      return res.send(result.content);
    }

    return res.status(404).send(result.error);
  }
}

module.exports = DocumentController;
