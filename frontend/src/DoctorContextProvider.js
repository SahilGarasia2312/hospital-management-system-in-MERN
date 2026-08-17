import React, { createContext, useState } from "react";

export const DoctorContext = createContext();

export const DoctorContextProvider = ({ children }) => {
    const [doctor, setDoctor] = useState({
        name: "Dr. Aditi Verma",
        specialization: "Cardiology",
        assignedPatients: [
            {
                id: 1,
                Pname: "Ravi Sharma",
                age: 45,
                disease: "Hypertension",
                admissionStatus: "Under Observation",
            },
            {
                id: 2,
                Pname: "Anita Singh",
                age: 32,
                disease: "Arrhythmia",
                admissionStatus: "Discharged",
            },
        ],
    });

    // Safely remove a patient
    const removePatient = (patientId) => {
        setDoctor((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                assignedPatients: prev.assignedPatients.filter(
                    (patient) => patient.id !== patientId
                ),
            };
        });
    };

    // Safely assign a new patient
    const assignPatient = (newPatient) => {
        setDoctor((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                assignedPatients: [...prev.assignedPatients, newPatient],
            };
        });
    };

    // Remove doctor function
    const removeDoctor = () => {
        setDoctor(null);
    };

    return (
        <DoctorContext.Provider value={{ doctor, removePatient, assignPatient, removeDoctor }}>
            {children}
        </DoctorContext.Provider>
    );
};
