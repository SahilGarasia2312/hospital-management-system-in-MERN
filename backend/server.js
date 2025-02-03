import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Doctor from "./model/Doctor.js";
import Patient from "./model/Patient.js";

const app = express();
const PORT = 8000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const DB_URI = "mongodb://localhost:27017/hpms";
mongoose
    .connect(DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

// Utility function to generate a new doctorId
const generateDoctorId = async() => {
    const lastDoctor = await Doctor.findOne().sort({ doctorId: -1 });
    return lastDoctor ? lastDoctor.doctorId + 1 : 1;
};

// Utility function to generate a new patientId
const generatePatientId = async() => {
    const lastPatient = await Patient.findOne().sort({ patientId: -1 });
    return lastPatient ? lastPatient.patientId + 1 : 1;
};

// Routes

// 1. Add Doctor - POST /doctors
app.post("/doctors", async(req, res) => {
    try {
        const { name, specialization, experience } = req.body;
        const doctorId = await generateDoctorId();

        const newDoctor = new Doctor({ doctorId, name, specialization, experience });
        await newDoctor.save();

        res.status(201).json({ message: "Doctor added successfully", doctor: newDoctor });
    } catch (error) {
        console.error("Error adding doctor:", error);
        res.status(500).json({ error: "Internal server error: " + error.message });
    }
});

// 2. Add Patient - POST /patients
// Add Patient - POST /doctors/:doctorId/patients
app.post("/doctors/:doctorId/patients", async(req, res) => {
    try {
        const doctorId = parseInt(req.params.doctorId); // Extract doctorId from URL path

        // Find the doctor by doctorId
        const doctor = await Doctor.findOne({ doctorId });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }

        // Generate a new patientId
        const patientId = await generatePatientId();

        // Destructure patient details from request body
        const { name, disease, admissionStatus, admittedDate, releasingDate, releasingSummary } = req.body;

        // Create a new patient
        const newPatient = new Patient({
            patientId,
            doctorId: doctor._id, // Store the doctor's ObjectId reference
            name,
            disease,
            admissionStatus,
            admittedDate,
            releasingDate,
            releasingSummary,
        });

        // Save the new patient
        await newPatient.save();

        res.status(201).json({ message: "Patient added successfully", patient: newPatient });
    } catch (error) {
        console.error("Error adding patient:", error);
        res.status(500).json({ error: "Internal server error: " + error.message });
    }
});


// 3. Get All Doctors - GET /doctors
app.get("/doctors", async(req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ error: "Internal server error: " + error.message });
    }
});

// 4. Get Doctor by ID - GET /doctors/:doctorId
app.get("/doctors/:doctorId", async(req, res) => {
    const doctorId = parseInt(req.params.doctorId); // Convert doctorId to a number

    if (isNaN(doctorId)) {
        return res.status(400).json({ error: "Invalid doctor ID" });
    }

    try {
        const doctor = await Doctor.findOne({ doctorId: doctorId }); // Use the parsed number
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        res.json(doctor);
    } catch (err) {
        console.error("Error fetching doctor by ID:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});




// 5. Delete Patient - DELETE /patients/:patientId
app.delete("/patients/:patientId", async(req, res) => {
    try {
        const patient = await Patient.findOneAndDelete({ patientId: parseInt(req.params.patientId) });
        if (!patient) return res.status(404).json({ error: "Patient not found" });
        res.status(200).json({ message: "Patient deleted successfully" });
    } catch (error) {
        console.error("Error deleting patient:", error);
        res.status(500).json({ error: "Internal server error: " + error.message });
    }
});

// 6. Delete Doctor - DELETE /doctors/:doctorId
app.delete("/doctors/:doctorId", async(req, res) => {
    try {
        const doctor = await Doctor.findOneAndDelete({ doctorId: parseInt(req.params.doctorId) });
        if (!doctor) return res.status(404).json({ error: "Doctor not found" });
        await Patient.deleteMany({ doctorId: doctor._id });
        res.status(200).json({ message: "Doctor and associated patients deleted successfully" });
    } catch (error) {
        console.error("Error deleting doctor:", error);
        res.status(500).json({ error: "Internal server error: " + error.message });
    }
});

// 7. Get Patients by Doctor ID - GET /doctors/:doctorId/patients
app.get("/doctors/:doctorId/patients", async(req, res) => {
    const doctorId = parseInt(req.params.doctorId); // Convert doctorId to a number

    if (isNaN(doctorId)) {
        return res.status(400).json({ error: "Invalid doctor ID" });
    }

    try {
        const doctor = await Doctor.findOne({ doctorId: doctorId });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }

        const patients = await Patient.find({ doctorId: doctor._id });
        res.status(200).json(patients);
    } catch (error) {
        console.error("Error fetching patients by doctor ID:", error);
        res.status(500).json({ error: "Internal server error: " + error.message });
    }
});
// 8. Update Doctor - PUT /doctors/:doctorId
app.put("/doctors/:doctorId", async(req, res) => {
    try {
        const { name, specialization, experience } = req.body;
        const doctor = await Doctor.findOneAndUpdate({ doctorId: parseInt(req.params.doctorId) }, { name, specialization, experience }, { new: true, runValidators: true });

        if (!doctor) return res.status(404).json({ error: "Doctor not found" });

        res.status(200).json({ message: "Doctor updated successfully", doctor });
    } catch (error) {
        console.error("Error updating doctor:", error);
        res.status(500).json({ error: "Internal server error: " + error.message });
    }
});

// 9. Update Patient - PUT /patients/:patientId
app.put("/patients/:patientId", async(req, res) => {
    try {
        const { name, disease, admissionStatus, admittedDate, releasingDate, releasingSummary } = req.body;
        const patient = await Patient.findOneAndUpdate({ patientId: parseInt(req.params.patientId) }, { name, disease, admissionStatus, admittedDate, releasingDate, releasingSummary }, { new: true, runValidators: true });

        if (!patient) return res.status(404).json({ error: "Patient not found" });

        res.status(200).json({ message: "Patient updated successfully", patient });
    } catch (error) {
        console.error("Error updating patient:", error);
        res.status(500).json({ error: "Internal server error: " + error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});