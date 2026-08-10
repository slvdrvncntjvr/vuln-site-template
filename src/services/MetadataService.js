require("dotenv").config();
const flagService = require("../services/flagService");

// Internal metadata service — simulates a cloud provider metadata endpoint
// that leaks instance credentials. Only reachable via SSRF from the server itself.
class MetadataService {
  static getInstanceMetadata() {
    return {
      instance_id: "i-0a1b2c3d4e5f6a7b8",
      region: "ap-southeast-1",
      role: "acme-shop-prod-ec2-role",
      iam_credentials: {
        access_key: "AKIA3FAKE4ACCESSKEY9",
        secret_key: "wJalrXUt/FAKEKEY/bPxRfiCYEXAMPLEKEY",
        session_token: flagService.getFlag("SSRF"),
      },
    };
  }
}

module.exports = MetadataService;
