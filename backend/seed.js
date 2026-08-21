// seed.js — Demo data seeder for interview presentations & reviewer testing
// Run: npm run seed
// Creates: Easy-to-remember Demo Users (Admin, Doctor, Patient) + Models

import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/user.model.js";
import Doctor from "./src/modules/doctor/doctor.model.js";
import Patient from "./src/modules/patient/patient.model.js";

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // ─── 1. Create Admin User ─────────────────────────────────────────────────
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@hpms.com",
      password: "admin123",
      role: "admin",
    });

    // ─── 2. Create Doctor User & Profile ──────────────────────────────────────
    const doctorUser = await User.create({
      name: "Dr. Arjun Sharma",
      email: "doctor@hpms.com",
      password: "doctor123",
      role: "doctor",
    });

    const doctorProfile = await Doctor.create({
      doctorId: 1,
      name: "Dr. Arjun Sharma",
      specialization: "Cardiologist",
      experience: 15,
      phone: "+91-9876543210",
      email: "doctor@hpms.com",
      userId: doctorUser._id,
    });

    await User.findByIdAndUpdate(doctorUser._id, { linkedId: doctorProfile._id, linkedModel: "Doctor" });

    // Also keep legacy alias arjun.sharma@hpms.com for backward compatible tests
    const legacyDoctorUser = await User.create({
      name: "Dr. Arjun Sharma",
      email: "arjun.sharma@hpms.com",
      password: "Doctor@123",
      role: "doctor",
    });
    await User.findByIdAndUpdate(legacyDoctorUser._id, { linkedId: doctorProfile._id, linkedModel: "Doctor" });

    // ─── 3. Create Patient User & Profile ─────────────────────────────────────
    const patientUser = await User.create({
      name: "Ravi Kumar",
      email: "patient@hpms.com",
      password: "patient123",
      role: "patient",
    });

    const patientProfile = await Patient.create({
      patientId: 1,
      doctorId: doctorProfile._id,
      userId: patientUser._id,
      name: "Ravi Kumar",
      age: 45,
      gender: "Male",
      contact: "+91-9812345678",
      disease: "Hypertension",
      symptoms: "High blood pressure, headaches, dizziness",
      medicinePrescribed: "Amlodipine 5mg, Losartan 50mg",
      admissionStatus: "Indoor",
      admittedDate: new Date("2024-01-15"),
      releasingSummary: "",
    });

    await User.findByIdAndUpdate(patientUser._id, { linkedId: patientProfile._id, linkedModel: "Patient" });

    // Also create secondary doctor & patient for rich UI lists
    const doctor2User = await User.create({
      name: "Dr. Priya Mehta",
      email: "priya.mehta@hpms.com",
      password: "doctor123",
      role: "doctor",
    });

    const doctor2Profile = await Doctor.create({
      doctorId: 2,
      name: "Dr. Priya Mehta",
      specialization: "Neurologist",
      experience: 10,
      phone: "+91-9876543211",
      email: "priya.mehta@hpms.com",
      userId: doctor2User._id,
    });

    await User.findByIdAndUpdate(doctor2User._id, { linkedId: doctor2Profile._id, linkedModel: "Doctor" });

    // ─── Summary ──────────────────────────────────────────────────────────────
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏥 HPMS Seed Complete! Easy-to-Remember Demo Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👑 Admin   → Email: admin@hpms.com   | Password: admin123");
    console.log("🩺 Doctor  → Email: doctor@hpms.com  | Password: doctor123");
    console.log("🧑 Patient → Email: patient@hpms.com | Password: patient123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
