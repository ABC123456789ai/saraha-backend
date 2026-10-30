import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },
twoFactorEnabled: {
  type: Boolean,
  default: false,
},

twoFactorSetupOtp: {
  type: String,
},

twoFactorSetupOtpExpiresAt: {
  type: Date,
},

twoFactorOtp: {
  type: String,
},

twoFactorOtpExpiresAt: {
  type: Date,
},
  emailVerificationOtp: {
  type: String,
},

emailVerificationOtpExpiresAt: {
  type: Date,
},

passwordResetOtp: {
  type: String,
},

passwordResetOtpExpiresAt: {
  type: Date,
},
});

const User = mongoose.model("User", userSchema);

export default User;