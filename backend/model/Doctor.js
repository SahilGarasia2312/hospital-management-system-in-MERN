import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    doctorId: {
        type: Number,
        required: [true, "Doctor ID is required"],
        unique: true,
    },
    name: {
        type: String,
        required: [true, "Doctor name is required"],
        minlength: [3, "Name must be at least 3 characters long"],
        maxlength: [100, "Name cannot exceed 100 characters"],
    },
    specialization: {
        type: String,
        enum: [
            "Cardiologist",
            "Neurologist",
            "Dermatologist",
            "Pediatrician",
            "Orthopedic",
            "Oncologist",
            "Psychiatrist"
        ],
        required: [true, "Specialization is required"],
    },

    experience: {
        type: Number,
        required: [true, "Experience is required"],
        min: [0, "Experience cannot be negative"],
    },
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;