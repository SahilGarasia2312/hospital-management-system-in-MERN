import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }
`;

const EditDoctor = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState({
        name: "",
        specialization: "",
        experience: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDoctorDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8000/doctors/${doctorId}`);
                const data = await response.json();
                if (response.ok) {
                    setDoctor({
                        name: data.name,
                        specialization: data.specialization,
                        experience: data.experience,
                    });
                } else {
                    setError("Doctor not found");
                }
            } catch (err) {
                setError("Error fetching doctor details");
            }
        };

        fetchDoctorDetails();
    }, [doctorId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDoctor((prevDoctor) => ({
            ...prevDoctor,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:8000/doctors/${doctorId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(doctor),
            });

            const data = await response.json();

            if (response.ok) {
                navigate(`/doctor/${doctorId}`);
            } else {
                setError(data.error || "Error updating doctor details");
            }
        } catch (err) {
            setError("Error updating doctor details");
        }
    };

    return (
        <Container>
            <Heading>Edit Doctor</Heading>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <Input
                    type="text"
                    name="name"
                    value={doctor.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                />
                <Input
                    type="text"
                    name="specialization"
                    value={doctor.specialization}
                    onChange={handleChange}
                    placeholder="Specialization"
                    required
                />
                <Input
                    type="number"
                    name="experience"
                    value={doctor.experience}
                    onChange={handleChange}
                    placeholder="Experience"
                    required
                />
                <Button type="submit">Update Doctor</Button>
            </form>
        </Container>
    );
};

export default EditDoctor;
