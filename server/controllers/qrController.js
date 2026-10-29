import crypto from "crypto";
import os from "os";
import { generateQRCodeDataURL } from "../utils/generateQR.js";
import User from "../models/User.js";
import MedicalProfile from "../models/MedicalProfile.js";
import EmergencyContact from "../models/EmergencyContact.js";
import QRScanHistory from "../models/QRScanHistory.js";
//import {notify} from '../services/notificationService.js';

const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    const lowerName = name.toLowerCase();

    // Ignore virtual / loopback / container network interfaces
    if (
      lowerName.includes("vethernet") ||
      lowerName.includes("veth") ||
      lowerName.includes("wsl") ||
      lowerName.includes("virtual") ||
      lowerName.includes("vmware") ||
      lowerName.includes("hyper-v") ||
      lowerName.includes("loopback") ||
      lowerName.includes("tunnel") ||
      lowerName.includes("tap") ||
      lowerName.includes("vpn") ||
      lowerName.includes("default switch") ||
      lowerName.includes("pseudo")
    ) {
      continue;
    }

    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        const ip = iface.address;
        if (ip.startsWith("169.254.")) continue; // Ignore APIPA link-local

        let score = 1;
        if (
          lowerName.includes("wi-fi") ||
          lowerName.includes("wifi") ||
          lowerName.includes("ethernet") ||
          lowerName.includes("wlan") ||
          lowerName.includes("eth") ||
          lowerName.includes("en0")
        ) {
          score += 10;
        }

        if (ip.startsWith("192.168.") || ip.startsWith("172.")) {
          score += 5;
        } else if (ip.startsWith("10.")) {
          score += 5;
        }

        candidates.push({ ip, score, name });
      }
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].ip;
  }

  // Fallback: return first non-internal IPv4 if filtering excluded all
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal && !iface.address.startsWith("169.254.")) {
        return iface.address;
      }
    }
  }

  return null;
};

export const generateQRCode = async (req, res) => {
  try {
    // Check if an explicit public domain or tunnel URL is set in environment
    const envClientUrl = process.env.PUBLIC_URL || process.env.CLIENT_URL || process.env.FRONTEND_URL;
    let clientUrl = envClientUrl || req.headers.origin;

    if (!clientUrl && req.headers.host) {
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
      const hostWithoutPort = req.headers.host.split(":")[0];
      clientUrl = `${protocol}://${hostWithoutPort}:5173`;
    }
    if (!clientUrl) {
      clientUrl = "http://localhost:5173";
    }
    clientUrl = clientUrl.replace(/\/$/, "");

    // Replace localhost/127.0.0.1 with LAN IP for local Wi-Fi testing.
    // If clientUrl is a public URL (e.g. ngrok, localtunnel, Vercel), keep it intact!
    if (clientUrl.includes("localhost") || clientUrl.includes("127.0.0.1")) {
      const lanIp = getLocalIpAddress();
      if (lanIp) {
        clientUrl = clientUrl.replace("localhost", lanIp).replace("127.0.0.1", lanIp);
      }
    }

    const userId = req.user._id;
    const user = await User.findById(userId).select("fullName phone");
    const profile = await MedicalProfile.findOne({ user: userId });
    const contacts = await EmergencyContact.find({ user: userId }).sort({ isPrimary: -1, createdAt: 1 });

    const primaryContact = contacts[0];
    const secondaryContact = contacts[1];

    // Compact signed emergency payload for offline scanner reading
    const compactPayload = {
      fn: user?.fullName || "Citizen",
      bg: profile?.bloodGroup || "",
      al: profile?.allergies || "None",
      mc: profile?.medicalConditions || "None",
      ice: primaryContact?.phone || user?.phone || "",
      ice1: primaryContact ? `${primaryContact.contactName} (${primaryContact.relationship}): ${primaryContact.phone}` : "",
      ice2: secondaryContact ? `${secondaryContact.contactName} (${secondaryContact.relationship}): ${secondaryContact.phone}` : "",
      od: profile?.organDonor || false,
      ts: Date.now(),
    };

    const secret = process.env.JWT_SECRET || "sankat_mochan_secret";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(compactPayload))
      .digest("hex")
      .slice(0, 10);

    const signedData = { ...compactPayload, sig: signature };
    const base64Data = Buffer.from(JSON.stringify(signedData)).toString("base64url");

    const emergencyUrl = `${clientUrl}/emergency/${userId}?data=${base64Data}`;
    const qrDataUrl = await generateQRCodeDataURL(emergencyUrl);

    res.status(200).json({
      success: true,
      userId,
      emergencyUrl,
      qrDataUrl,
      offlinePayload: signedData,
      encodedData: base64Data,
    });
  } catch (error) {
    console.error("QR ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getQRScanHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const history = await QRScanHistory.find({
      $or: [{ scannedUser: userId }, { scannedBy: userId }],
    })
      .populate("scannedUser", "fullName email phone accountType")
      .populate("scannedBy", "fullName email phone accountType isVerified profession organization")
      .sort({ createdAt: -1 })
      .limit(200);

    const totalScans = history.length;
    const responderScans = history.filter(
      (h) => h.scannerRole === "responder"
    ).length;
    const citizenScans = history.filter(
      (h) => h.scannerRole === "citizen" || h.scannerRole === "admin"
    ).length;
    const anonymousScans = history.filter(
      (h) => h.scannerRole === "anonymous"
    ).length;

    const stats = {
      totalScans,
      responderScans,
      citizenScans,
      anonymousScans,
      lastScannedAt: history[0]?.createdAt || null,
    };

    res.status(200).json({
      success: true,
      stats,
      history,
    });
  } catch (error) {
    console.error("GET QR HISTORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const clearQRScanHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    await QRScanHistory.deleteMany({ scannedUser: userId });
    res.status(200).json({
      success: true,
      message: "QR scan history cleared successfully.",
    });
  } catch (error) {
    console.error("CLEAR QR HISTORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteQRScanHistoryItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const deleted = await QRScanHistory.findOneAndDelete({
      _id: id,
      scannedUser: userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "History entry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Scan record deleted.",
    });
  } catch (error) {
    console.error("DELETE QR HISTORY ITEM ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


