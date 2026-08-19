import express from "express";
import authRoutes from "../../modules/auth/auth.routes.js";
import doctorRoutes from "../../modules/doctor/doctor.routes.js";
import patientRoutes from "../../modules/patient/patient.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/doctors", doctorRoutes);
router.use("/patients", patientRoutes);

export default router;
