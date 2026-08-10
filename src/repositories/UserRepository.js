require("dotenv").config();
const flagService = require("../services/flagService");

// User store. Passwords stored in plaintext for the demo app (intentional weak auth).
const USERS = new Map([
  ["1", {
    id: 1,
    username: "alice.admin",
    fullName: "Alice Admin",
    email: "alice@acmeshop.internal",
    role: "ADMINISTRATOR",
    memberSince: "2020-01-15",
    // Private order history — only visible to the account owner
    orderHistory: [
      { orderId: "ORD-0001", item: "Acme Anvil 5000", total: 99.99, status: "Delivered" },
      { orderId: "ORD-0002", item: "Acme Rocket Boots", total: 499.99, status: "Delivered" },
      // Admin's personal access token stored in order notes (realistic data hiding)
      { orderId: "ORD-0003", item: "Acme Portable Hole", total: 299.99, status: "Pending", accessToken: flagService.getFlag("IDOR") },
    ],
  }],
  ["2", {
    id: 2,
    username: "bob.shopper",
    fullName: "Bob Shopper",
    email: "bob@example.com",
    role: "CUSTOMER",
    memberSince: "2022-08-10",
    orderHistory: [
      { orderId: "ORD-1001", item: "Acme Portable Hole", total: 299.99, status: "Delivered" },
    ],
  }],
]);

class UserRepository {
  findById(id) {
    return USERS.get(String(id)) || null;
  }

  // Returns only public profile info — safe by default
  getPublicProfile(id) {
    const user = this.findById(id);
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      memberSince: user.memberSince,
    };
  }

  // Returns full record including order history — should be access-controlled
  getFullProfile(id) {
    return this.findById(id);
  }
}

module.exports = new UserRepository();
