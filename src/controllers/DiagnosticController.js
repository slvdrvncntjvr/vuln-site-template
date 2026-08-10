const shellExecutor = require("../utils/ShellExecutor");

class DiagnosticController {
  static runPing(req, res) {
    const host = req.query.host;
    shellExecutor.runDiagnosticPing(host, (err, output) => {
      res.send(output);
    });
  }
}

module.exports = DiagnosticController;
