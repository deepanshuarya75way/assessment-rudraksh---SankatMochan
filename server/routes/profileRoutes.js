import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  createMedicalProfile,
  getMedicalProfile,
  getNotificationSetting,
  updateMedicalProfile,
  updateNotificationSettings,
} from "../controllers/profileController.js";

const router = express.Router();

router.post("/", protect, createMedicalProfile);

router.get("/", protect, getMedicalProfile);

router.put("/", protect, updateMedicalProfile);

router.get('/notification-settings',getNotificationSetting);

router.put('notification-settings',updateNotificationSettings);

export default router;