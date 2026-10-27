import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
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
      minlength: 6,
    },

    phone: {
      type: String,
      required: true,
    },

    accountType: {
      type: String,
      enum: ["normal", "responder"],
      default: "normal",
    },

    profession: {
      type: String,
      default: "",
      trim: true,
    },

    organization: {
      type: String,
      default: "",
      trim: true,
    },

    professionalId: {
      type: String,
      default: "",
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationStatus: {
      type: String,
      enum: [
        "not_required",
        "not_submitted",
        "pending",
        "approved",
        "rejected",
      ],
      default: "not_required",
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    city: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    resetOtp: {
      type: String,
      default: "",
    },

    resetOtpExpires: {
      type: Date,
      default: null,
    },

    noticationSettings:{
      inApp:{type:Boolean,default:true},
      email:{type:Boolean,default:false},
      qrScan:{type:Boolean,default:true},
      sos:{type:Boolean,default:true},
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);