const userRepository = require("../repositories/UserRepository");

class UserController {
  // GET /api/users/:id/profile
  // Headers expected: X-User-Id (the authenticated session user)
  //
  // Bug: the controller checks that X-User-Id is present but does NOT verify
  // it matches the requested :id. It always returns the full profile including
  // private orderHistory. An attacker logged in as User 2 can request User 1's
  // full profile and read User 1's private order data.
  static getProfile(req, res) {
    const targetId = req.params.id;
    const requestingUserId = req.headers["x-user-id"];

    if (!requestingUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const profile = userRepository.getFullProfile(targetId);
    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(profile);
  }
}

module.exports = UserController;
