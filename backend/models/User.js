const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  companyName: { type: String, required: true },
  tenantId: { type: String, required: true, unique: true },
  plan: { type: String, default: "free" }, // free, premium
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
