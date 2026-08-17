// seed.js — Demo data seeder for interview presentations
// Run: npm run seed
// Creates: 1 Admin + 2 Doctors + 2 Patients with linked User accounts

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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
      name: "Admin Singh",
      email: "admin@hpms.com",
      password: "Admin@123",
      role: "admin",
    });
    console.log("✅ Admin created: admin@hpms.com / Admin@123");

    // ─── 2. Create Doctors ────────────────────────────────────────────────────
    const doctorUser1 = await User.create({
      name: "Dr. Arjun Sharma",
      email: "arjun.sharma@hpms.com",
      password: "Doctor@123",
      role: "doctor",
    });

    const doctorUser2 = await User.create({
      name: "Dr. Priya Mehta",
      email: "priya.mehta@hpms.com",
      password: "Doctor@123",
      role: "doctor",
    });

    const doctor1 = await Doctor.create({
      doctorId: 1,
      name: "Dr. Arjun Sharma",
      specialization: "Cardiologist",
      experience: 15,
      phone: "+91-9876543210",
      email: "arjun.sharma@hpms.com",
      userId: doctorUser1._id,
    });

    const doctor2 = await Doctor.create({
      doctorId: 2,
      name: "Dr. Priya Mehta",
      specialization: "Neurologist",
      experience: 10,
      phone: "+91-9876543211",
      email: "priya.mehta@hpms.com",
      userId: doctorUser2._id,
    });

    // Link doctor userId back
    await User.findByIdAndUpdate(doctorUser1._id, { linkedId: doctor1._id, linkedModel: "Doctor" });
    await User.findByIdAndUpdate(doctorUser2._id, { linkedId: doctor2._id, linkedModel: "Doctor" });

    console.log("✅ Doctors created: arjun.sharma@hpms.com / priya.mehta@hpms.com — Password: Doctor@123");

    // ─── 3. Create Patients ───────────────────────────────────────────────────
    const patientUser1 = await User.create({
      name: "Ravi Kumar",
      email: "ravi.kumar@hpms.com",
      password: "Patient@123",
      role: "patient",
    });

    const patientUser2 = await User.create({
      name: "Anita Patel",
      email: "anita.patel@hpms.com",
      password: "Patient@123",
      role: "patient",
    });

    const patient1 = await Patient.create({
      patientId: 1,
      doctorId: doctor1._id,
      userId: patientUser1._id,
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

    const patient2 = await Patient.create({
      patientId: 2,
      doctorId: doctor2._id,
      userId: patientUser2._id,
      name: "Anita Patel",
      age: 38,
      gender: "Female",
      contact: "+91-9823456789",
      disease: "Migraine",
      symptoms: "Severe headaches, nausea, light sensitivity",
      medicinePrescribed: "Sumatriptan 50mg, Propranolol 40mg",
      admissionStatus: "Outdoor",
      admittedDate: null,
      releasingSummary: "Managed outpatient. Follow-up in 2 weeks.",
    });

    await User.findByIdAndUpdate(patientUser1._id, { linkedId: patient1._id, linkedModel: "Patient" });
    await User.findByIdAndUpdate(patientUser2._id, { linkedId: patient2._id, linkedModel: "Patient" });

    console.log("✅ Patients created: ravi.kumar@hpms.com / anita.patel@hpms.com — Password: Patient@123");

    // ─── Summary ──────────────────────────────────────────────────────────────
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏥 HPMS Seed Complete! Demo Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👑 Admin   → admin@hpms.com       / Admin@123");
    console.log("🩺 Doctor  → arjun.sharma@hpms.com / Doctor@123");
    console.log("🩺 Doctor  → priya.mehta@hpms.com  / Doctor@123");
    console.log("🧑 Patient → ravi.kumar@hpms.com   / Patient@123");
    console.log("🧑 Patient → anita.patel@hpms.com  / Patient@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
