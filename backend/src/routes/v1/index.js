import express from "express";
import authRoutes from "../../modules/auth/auth.routes.js";
import doctorRoutes from "../../modules/doctor/doctor.routes.js";
import patientRoutes from "../../modules/patient/patient.routes.js";
import appointmentRoutes from "../../modules/appointment/appointment.routes.js";
import visitRoutes from "../../modules/visit/visit.routes.js";
import medicineRoutes from "../../modules/medicine/medicine.routes.js";
import prescriptionRoutes from "../../modules/prescription/prescription.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/doctors", doctorRoutes);
router.use("/patients", patientRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/visits", visitRoutes);
router.use("/medicines", medicineRoutes);
router.use("/prescriptions", prescriptionRoutes);

export default router;
