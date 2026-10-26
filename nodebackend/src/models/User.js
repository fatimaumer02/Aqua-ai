/**
 * A registered user (citizen, expert/environmental officer, or researcher).
 * Passwords are never stored in plain text - only the bcrypt hash.
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["citizen", "expert", "researcher"],
      default: "citizen",
    },
  },
  { timestamps: true }
);

// Never send the password hash back in any API response.
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
