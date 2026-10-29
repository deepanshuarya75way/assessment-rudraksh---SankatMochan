import User from "../models/User.js";
import MedicalProfile from "../models/MedicalProfile.js";
import EmergencyContact from "../models/EmergencyContact.js";
import Insurance from "../models/Insurance.js";
import PatientDocument from "../models/PatientDocument.js";
import QRScanHistory from "../models/QRScanHistory.js";
import { getIO } from "../config/socket.js";
import { generateAITriageAdvice } from "../services/aiService.js";
import {notify} from '../services/notificationService.js';

// =====================================================
// GET PUBLIC EMERGENCY CARD
// =====================================================

export const getEmergencyCard = async (req, res) => {
  try {
    const { userId } = req.params;

    // =================================================
    // FIND PATIENT
    // =================================================

    const user = await User.findById(userId).select(
      "fullName phone email"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Record QR scan history
    try {
      let scannerName = "Anonymous First Responder";
      let scannerRole = "anonymous";
      let scannedBy = null;

      if (req.user) {
        scannedBy = req.user._id;
        const isResp =
          req.user.accountType === "responder" &&
          req.user.isVerified === true &&
          req.user.verificationStatus === "approved";
        const isAdmin = req.user.role === "admin";
        scannerRole = isResp ? "responder" : isAdmin ? "admin" : "citizen";
        scannerName = req.user.fullName
          ? `${req.user.fullName}${isResp ? " (Verified Responder)" : ""}`
          : isResp
            ? "Verified Emergency Responder"
            : "Registered Citizen";
      }

      const userAgentStr = req.headers["user-agent"] || "";
      let deviceType = "Mobile Browser";
      if (/android/i.test(userAgentStr)) deviceType = "Android Device";
      else if (/iphone|ipad|ipod/i.test(userAgentStr)) deviceType = "iOS Device";
      else if (/windows|macintosh|linux/i.test(userAgentStr)) deviceType = "Desktop Browser";

      const clientIp =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        req.ip ||
        "Unknown IP";

      const scanEntry = await QRScanHistory.create({
        scannedUser: userId,
        scannedBy,
        scannerName,
        scannerRole,
        ipAddress: clientIp,
        userAgent: userAgentStr,
        deviceType,
      });

      console.log(`\n==================================================`);
      console.log(`📱 [QR SCAN RECORDED] Patient: ${userId} | By: ${scannerName} (${scannerRole})`);
      console.log(`==================================================\n`);

      const io = getIO();
      if (io) {
        io.to(`user_${userId}`).emit("qr_scanned", scanEntry);
        await notify(userId,{
    type : "qr_scan",
    title : "you qr scanned",
    message : `Scanned at ${new Date().toLocaleString()}`,
    meta : {scannedBy:req.user?._id || null},
  })
      }

    } catch (historyErr) {
      console.error("Failed to log QR scan history:", historyErr);
    }

    // =================================================
    // MEDICAL PROFILE
    // =================================================

    const profile = await MedicalProfile.findOne({
      user: userId,
    });

    // =================================================
    // EMERGENCY CONTACT
    // =================================================

    const contacts = await EmergencyContact.find({
      user: userId,
    }).sort({ isPrimary: -1, createdAt: 1 });

    const isVerifiedResponder =
      req.user &&
      req.user.accountType === "responder" &&
      req.user.isVerified === true &&
      req.user.verificationStatus === "approved";

    const emergencyCard = {
      fullName: user.fullName,
      bloodGroup: profile?.bloodGroup || "",
      emergencyContact: contacts[0] || null,
      emergencyContacts: contacts,
      accessLevel: isVerifiedResponder
        ? "verified_responder"
        : "public",
    };

    // =================================================
    // VERIFIED RESPONDER INFORMATION
    // =================================================

    if (isVerifiedResponder) {

      // -----------------------------------------------
      // FULL MEDICAL PROFILE
      // -----------------------------------------------

      emergencyCard.medicalProfile = {
        dateOfBirth:
          profile?.dateOfBirth || null,

        gender:
          profile?.gender || "",

        height:
          profile?.height || 0,

        weight:
          profile?.weight || 0,

        allergies:
          profile?.allergies || "",

        medicalConditions:
          profile?.medicalConditions || "",

        medications:
          profile?.medications || "",

        organDonor:
          profile?.organDonor || false,

        address:
          profile?.address || "",
      };

      // -----------------------------------------------
      // CONTACT
      // -----------------------------------------------

      emergencyCard.phone = user.phone;
      emergencyCard.email = user.email;

      // -----------------------------------------------
      // INSURANCE
      // -----------------------------------------------

      emergencyCard.insurance =
        await Insurance.findOne({
          user: userId,
        }).sort({
          createdAt: -1,
        });

      // -----------------------------------------------
      // MEDICAL DOCUMENTS
      // -----------------------------------------------

      const documents =
        await PatientDocument.find({
          user: userId,
        })
          .select(
            "_id documentType fileName fileUrl publicId resourceType createdAt"
          )
          .sort({
            createdAt: -1,
          });

      console.log("=================================");
      console.log("EMERGENCY CARD");
      console.log("QR USER ID:", userId);
      console.log("DOCUMENT COUNT:", documents.length);
      console.log("DOCUMENTS:", documents);
      console.log("=================================");

      emergencyCard.documents = documents;
    }

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      emergencyCard,
    });

  } catch (error) {
    console.error(
      "GET EMERGENCY CARD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET AI TRIAGE ADVICE
// =====================================================

export const getAITriageAdvice = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("fullName");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const profile = await MedicalProfile.findOne({ user: userId });

    const triageAdvice = await generateAITriageAdvice({
      fullName: user.fullName,
      bloodGroup: profile?.bloodGroup || "",
      allergies: profile?.allergies || "",
      medicalConditions: profile?.medicalConditions || "",
      medications: profile?.medications || "",
      organDonor: profile?.organDonor || false,
      gender: profile?.gender || "",
    });

    return res.status(200).json({
      success: true,
      triageAdvice,
    });
  } catch (error) {
    console.error("GET AI TRIAGE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
