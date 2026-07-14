import React, { useState, useEffect } from "react";

const App = () => {
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [newDoctor, setNewDoctor] = useState({ name: "", specialization: "", experience: "" });
    const [newPatient, setNewPatient] = useState({ name: "", disease: "", admissionStatus: "Indoor", doctorId: "", admittedDate: "", releasingDate: "", releasingSummary: "" });
    const [doctorId, setDoctorId] = useState("");

    useEffect(() => {
        // Fetch doctors on load
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        const response = await fetch("http://localhost:8000/doctors");
        const data = await response.json();
        setDoctors(data);
    };

    const fetchPatients = async (doctorId) => {
        const response = await fetch(`http://localhost:8000/doctors/${doctorId}/patients`);
        const data = await response.json();
        setPatients(data);
    };

    const handleAddDoctor = async () => {
        const response = await fetch("http://localhost:8000/doctors", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newDoctor),
        });
        const data = await response.json();
        fetchDoctors(); // Refresh doctors list after adding new one
    };

    const handleAddPatient = async () => {
        const response = await fetch(`http://localhost:8000/doctors/${newPatient.doctorId}/patients`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newPatient),
        });
        const data = await response.json();
        fetchPatients(newPatient.doctorId); // Refresh patients list for the selected doctor
    };

    const handleUpdateDoctor = async (doctorId, updatedDoctor) => {
        const response = await fetch(`http://localhost:8000/doctors/${doctorId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedDoctor),
        });
        const data = await response.json();
        fetchDoctors(); // Refresh doctor list after update
    };

    const handleUpdatePatient = async (patientId, updatedPatient) => {
        const response = await fetch(`http://localhost:8000/patients/${patientId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedPatient),
        });
        const data = await response.json();
        fetchPatients(newPatient.doctorId); // Refresh patients list after update
    };

    const handleDeleteDoctor = async (doctorId) => {
        const response = await fetch(`http://localhost:8000/doctors/${doctorId}`, {
            method: "DELETE",
        });
        const data = await response.json();
        fetchDoctors(); // Refresh doctor list after deletion
    };

    const handleDeletePatient = async (patientId) => {
        const response = await fetch(`http://localhost:8000/patients/${patientId}`, {
            method: "DELETE",
        });
        const data = await response.json();
        fetchPatients(doctorId); // Refresh patient list after deletion
    };

    return (
        <div className="App">
            <h1>Hospital Management System</h1>

            <div>
                <h2>Add Doctor</h2>
                <input
                    type="text"
                    placeholder="Name"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Specialization"
                    value={newDoctor.specialization}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Experience"
                    value={newDoctor.experience}
                    onChange={(e) => setNewDoctor({ ...newDoctor, experience: e.target.value })}
                />
                <button onClick={handleAddDoctor}>Add Doctor</button>
            </div>

            <div>
                <h2>Doctors List</h2>
                {doctors.map((doctor) => (
                    <div key={doctor.doctorId}>
                        <p>{doctor.name} - {doctor.specialization}</p>
                        <button onClick={() => fetchPatients(doctor.doctorId)}>Show Patients</button>
                        <button onClick={() => handleUpdateDoctor(doctor.doctorId, { name: "Updated Name", specialization: "Updated Specialization", experience: 5 })}>Update Doctor</button>
                        <button onClick={() => handleDeleteDoctor(doctor.doctorId)}>Delete Doctor</button>
                    </div>
                ))}
            </div>

            <div>
                <h2>Patients List for Doctor ID: {doctorId}</h2>
                {patients.map((patient) => (
                    <div key={patient.patientId}>
                        <p>{patient.name} - {patient.disease}</p>
                        <button onClick={() => handleUpdatePatient(patient.patientId, { ...patient, disease: "Updated Disease" })}>Update Patient</button>
                        <button onClick={() => handleDeletePatient(patient.patientId)}>Delete Patient</button>
                    </div>
                ))}
            </div>

            <div>
                <h2>Add Patient</h2>
                <input
                    type="text"
                    placeholder="Patient Name"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Disease"
                    value={newPatient.disease}
                    onChange={(e) => setNewPatient({ ...newPatient, disease: e.target.value })}
                />
                <select
                    value={newPatient.admissionStatus}
                    onChange={(e) => setNewPatient({ ...newPatient, admissionStatus: e.target.value })}
                >
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                </select>
                <input
                    type="date"
                    value={newPatient.admittedDate}
                    onChange={(e) => setNewPatient({ ...newPatient, admittedDate: e.target.value })}
                />
                <input
                    type="date"
                    value={newPatient.releasingDate}
                    onChange={(e) => setNewPatient({ ...newPatient, releasingDate: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Releasing Summary"
                    value={newPatient.releasingSummary}
                    onChange={(e) => setNewPatient({ ...newPatient, releasingSummary: e.target.value })}
                />
                <button onClick={handleAddPatient}>Add Patient</button>
            </div>
        </div>
    );
};

export default App;
