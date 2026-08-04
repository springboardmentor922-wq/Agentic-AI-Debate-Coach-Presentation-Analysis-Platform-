const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,

    experience: {
      type: String,
      enum: ["Beginner", "Intermediate", "Expert"],
      default: "Beginner"
    },

    assignedCoach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // ✅ NEW — cold-start onboarding survey answers
    preferredFormats: {
      type: [String],
      default: []
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
