/**
 * seed.js — Create the first admin user directly in MongoDB.
 *
 * Usage:
 *   node seed.js
 *   ADMIN_EMAIL=custom@example.com ADMIN_PASSWORD=MyPass123 node seed.js
 *
 * Requires a .env file (or environment variables) with MONGO_URI set.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/user");

const ADMIN = {
  firstName: process.env.ADMIN_FIRST_NAME || "Super",
  lastName: process.env.ADMIN_LAST_NAME || "Admin",
  email: process.env.ADMIN_EMAIL || "admin@example.com",
  password: process.env.ADMIN_PASSWORD || "Admin@1234",
  role: "admin",
};

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌  MONGO_URI is not set. Check your .env file.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅  Connected to MongoDB.");

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log(`⚠️   Admin already exists: ${ADMIN.email}`);
    await mongoose.disconnect();
    return;
  }

  const admin = await User.create(ADMIN);
  console.log(`🎉  Admin created successfully!`);
  console.log(`    Name  : ${admin.fullName}`);
  console.log(`    Email : ${admin.email}`);
  console.log(`    Role  : ${admin.role}`);
  console.log(`    ID    : ${admin._id}`);
}

seed()
  .catch((err) => {
    console.error("❌  Seed failed:", err.message);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());
