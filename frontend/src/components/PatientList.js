import React, { useState, useContext, useEffect } from "react";
import { DoctorContext } from "../DoctorContextProvider";
import "../CompStyles/PatientList.css";

const PatientList = () => {
  const { removePatient } = useContext(DoctorContext);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);

  // Fetch all doctors when the component mounts
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("http://localhost:8000/doctors/");
        const data = await response.json();
        if (response.ok) {
          setDoctors(data);
        } else {
          console.error("Error fetching doctors:", data.error);
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch patients when the selected doctor changes
  useEffect(() => {
    const fetchPatients = async () => {
      if (selectedDoctor) {
        try {
          const response = await fetch(
            `http://localhost:8000/doctors/${selectedDoctor}/patients`
          );
          const data = await response.json();
          if (response.ok) {
            setPatients(data);
          } else {
            console.error("Error fetching patients:", data.error);
            setPatients([]);
          }
        } catch (err) {
          console.error("Error fetching patients:", err);
        }
      }
    };

    fetchPatients();
  }, [selectedDoctor]);

  // Handle patient removal with confirmation
  const handleRemovePatient = async (patientId) => {
    if (!window.confirm("Are you sure you want to remove this patient?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/patients/${patientId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Patient removed successfully!");
        setPatients((prevPatients) =>
          prevPatients.filter((patient) => patient.patientId !== patientId)
        );
        removePatient(patientId);
      } else {
        const data = await response.text();
        try {
          const jsonData = JSON.parse(data);
          console.error("Error removing patient:", jsonData.error || "Unknown error");
        } catch (err) {
          console.error("Error removing patient (non-JSON response):", data);
        }
      }
    } catch (err) {
      console.error("Error removing patient:", err);
    }
  };

  // Handle patient update
  const handleUpdatePatient = async (patient) => {
    try {
      const response = await fetch(`http://localhost:8000/patients/${patient.patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patient),
      });

      if (response.ok) {
        alert("Patient updated successfully!");
        setPatients((prevPatients) =>
          prevPatients.map((p) => (p.patientId === patient.patientId ? patient : p))
        );
        setEditingPatient(null);
      } else {
        console.error("Error updating patient");
      }
    } catch (err) {
      console.error("Error updating patient:", err);
    }
  };

  return (
    <div className="container">
      <div className="left-section">
        <select
          value={selectedDoctor || ""}
          onChange={(e) => setSelectedDoctor(e.target.value)}
        >
          <option value="">Select Doctor</option>
          {doctors.map((doc) => (
            <option key={doc.doctorId} value={doc.doctorId}>
              {doc.name} ({doc.specialization})
            </option>
          ))}
        </select>
      </div>

      <div className="right-section">
        <h2 className="patient-list-title">Assigned Patients</h2>
        <ul className="patient-list">
          {patients.length > 0 ? (
            patients.map((patient) => (
              <li key={patient.patientId} className="patient-item">
                <div className="patient-details">
                  <strong> Name: </strong>{patient.name}
                  <br />
                  <strong> Disease </strong>{patient.disease}
                  <br />
                  <div className="patient-actions">
                    <button
                      className="remove-button"
                      onClick={() => handleRemovePatient(patient.patientId)}
                    >
                      Remove Patient
                    </button>
                    <button
                      className="edit-button"
                      onClick={() => setEditingPatient(patient)}
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {editingPatient?.patientId === patient.patientId && (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editingPatient.name}
                      onChange={(e) =>
                        setEditingPatient({ ...editingPatient, name: e.target.value })
                      }
                      placeholder="Patient Name"
                    />
                    <input
                      type="text"
                      value={editingPatient.disease}
                      onChange={(e) =>
                        setEditingPatient({ ...editingPatient, disease: e.target.value })
                      }
                      placeholder="Disease"
                    />
                    <button
                      className="edit-button"
                      onClick={() => handleUpdatePatient(editingPatient)}
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </li>
            ))
          ) : (
            <li>No patients assigned to this doctor</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PatientList;
