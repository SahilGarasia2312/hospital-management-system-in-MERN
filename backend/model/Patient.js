import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    patientId: {
        type: Number,
        required: [true, "Patient ID is required"],
        unique: true,
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    name: {
        type: String,
        required: [true, "Patient name is required"],
        minlength: [3, "Name must be at least 3 characters long"],
        maxlength: [100, "Name cannot exceed 100 characters"],
    },
    disease: {
        type: String,
        required: [true, "Disease is required"],
    },
    admissionStatus: {
        type: String,
        enum: ["Indoor", "Outdoor"],
        required: [true, "Admission status is required"],
    },
    admittedDate: {
        type: Date,
    },
    releasingDate: {
        type: Date,
    },
    releasingSummary: {
        type: String,
    },
});

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;