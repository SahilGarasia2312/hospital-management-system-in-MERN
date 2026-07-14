import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 50px auto;
  font-family: "Helvetica", sans-serif;
`;

const Heading = styled.h2`
  color: #007bff;
  margin-bottom: 20px;
`;

const Detail = styled.p`
  font-size: 1.1rem;
  margin: 10px 0;
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const EditButton = styled.button`
  display: inline-block;
  margin-top: 20px;
  margin-left: 10px;
  padding: 10px 20px;
  background-color: #28a745;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }
`;

const RemoveButton = styled.button`
  display: inline-block;
  margin-top: 20px;
  margin-left: 10px;
  padding: 10px 20px;
  background-color: #dc3545;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #c82333;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const DoctorDetail = () => {
    const { doctorId } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingDoctor, setEditingDoctor] = useState(null);

    useEffect(() => {
        if (!doctorId) {
            setError("Doctor ID is missing in the URL.");
            setLoading(false);
            return;
        }

        const fetchDoctorById = async () => {
            try {
                const response = await fetch(`http://localhost:8000/doctors/${doctorId}`);
                const data = await response.json();
                if (response.ok) {
                    setDoctor(data);
                    if (data.doctorId) {
                        fetchPatients(data.doctorId);
                    } else {
                        setError("Doctor ID is missing.");
                    }
                } else {
                    setError(data.error || "Error fetching doctor details");
                }
            } catch (err) {
                setError("Network error: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchPatients = async (doctorId) => {
            try {
                const response = await fetch(`http://localhost:8000/doctors/${doctorId}/patients`);
                const data = await response.json();
                if (response.ok) {
                    setPatients(data);
                } else {
                    setPatients([]);
                }
            } catch (err) {
                setPatients([]);
            }
        };

        fetchDoctorById();
    }, [doctorId]);

    // Handle doctor update
    const handleUpdateDoctor = async (updatedDoctor) => {
        try {
            const response = await fetch(`http://localhost:8000/doctors/${doctorId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedDoctor),
            });

            if (response.ok) {
                alert("Doctor updated successfully!");
                setDoctor(updatedDoctor);
                setEditingDoctor(null);
            } else {
                console.error("Error updating doctor");
            }
        } catch (err) {
            console.error("Error updating doctor:", err);
        }
    };

    // Handle doctor removal with confirmation
    const handleRemoveDoctor = async () => {
        if (!window.confirm("Are you sure you want to remove this doctor?")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/doctors/${doctorId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Doctor removed successfully!");
                // Redirect or perform other necessary actions after removal
            } else {
                const data = await response.json();
                console.error("Error removing doctor:", data.error || "Unknown error");
            }
        } catch (err) {
            console.error("Error removing doctor:", err);
        }
    };

    if (loading) {
        return <Container>Loading...</Container>;
    }

    if (error) {
        return <Container>Error: {error}</Container>;
    }

    return (
        <Container>
            <Heading>Doctor Details</Heading>
            {editingDoctor ? (
                <>
                    <Input
                        type="text"
                        value={editingDoctor.name}
                        onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                        placeholder="Doctor Name"
                    />
                    <Input
                        type="text"
                        value={editingDoctor.specialization}
                        onChange={(e) =>
                            setEditingDoctor({ ...editingDoctor, specialization: e.target.value })
                        }
                        placeholder="Specialization"
                    />
                    <EditButton onClick={() => handleUpdateDoctor(editingDoctor)}>
                        Save Changes
                    </EditButton>
                </>
            ) : (
                <>
                    <Detail><strong>Name:</strong> {doctor.name}</Detail>
                    <Detail><strong>Specialization:</strong> {doctor.specialization}</Detail>
                    <Detail><strong>Experience:</strong> {doctor.experience} years</Detail>
                </>
            )}

            <Heading>Assigned Patients</Heading>
            {patients.length > 0 ? (
                patients.map((patient, index) => (
                    <Detail key={index}>
                        <strong>Patient {index + 1}:</strong> {patient.name}
                    </Detail>
                ))
            ) : (
                <Detail>No assigned patients.</Detail>
            )}

            <div>
                <BackLink to="/doctor">Back to Doctors</BackLink>
                <EditButton onClick={() => setEditingDoctor(doctor)}>Edit Doctor</EditButton>
                <RemoveButton onClick={handleRemoveDoctor}>Remove Doctor</RemoveButton>
            </div>
        </Container>
    );
};

export default DoctorDetail;
