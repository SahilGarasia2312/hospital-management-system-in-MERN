import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CompStyles/navbar.css";
import "../CompStyles/doctor.css";
import styled from "styled-components";

// StyledLink for navigation
const StyledLink = styled(Link)`
    text-decoration: none;
    color: #fff;
    font-size: 18px;
    margin-right: 20px;
    padding: 10px 20px;
    border-radius: 5px;
    background-color: #007bff;
    transition: background-color 0.3s ease, transform 0.2s ease;

    &:hover {
        background-color: #0056b3;
        transform: translateY(-3px);
    }

    &:active {
        color: #00bfa6;
    }
    `;

const getBackgroundColor = (specialization) => {
    switch (specialization.toLowerCase()) {
        case "cardiologist":
            return "#e0f7fa"; // Light teal
        case "neurologist":
            return "#e8f5e9"; // Light green
        case "orthopaedist":
            return "#fff9c4"; // Light yellow
        case "pediatrician":
            return "#fce4ec"; // Light pink
        default:
            return "#ffffff";
    }
};

// Function to get image URL based on specialization
const getImageUrl = (specialization) => {
    switch (specialization.toLowerCase()) {
        case "cardiologist":
            return "https://images.nightcafe.studio/jobs/JyzQNaXu5aNuo7kcf8G5/JyzQNaXu5aNuo7kcf8G5--0--v0v83.jpg?tr=w-1600,c-at_max";
        case "neurologist":
            return "https://images.nightcafe.studio/jobs/rob1O11rk6RbeDkWEcAk/rob1O11rk6RbeDkWEcAk--0--isp97.jpg?tr=w-1600,c-at_max";
        case "orthopaedist":
            return "https://images.nightcafe.studio/jobs/rsDtEFW6N46LzOh2ZX0I/rsDtEFW6N46LzOh2ZX0I--0--7w6lu.jpg?tr=w-1600,c-at_max";
        case "pediatrician":
            return "https://images.nightcafe.studio/jobs/fGIUpcIltcA9SBvz0js3/fGIUpcIltcA9SBvz0js3--0--1es7e.jpg?tr=w-1600,c-at_max";
        default:
            return "https://via.placeholder.com/100x100?text=Doctor";
    }
};

const Doctor = () => {
    const [doctorInfo, setDoctorInfo] = useState([]); // Store doctor data
    const navigate = useNavigate();

    // Fetch doctors data on component mount
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch("http://localhost:8000/doctors"); // Fetch doctor data from the API
                const data = await response.json();
                if (response.ok) {
                    setDoctorInfo(data); // Set doctor data to state
                } else {
                    console.error("Error fetching doctor details:", data.error);
                }
            } catch (err) {
                console.error("Error fetching doctor details:", err);
            }
        };

        fetchDoctors();
    }, []); // Empty dependency array ensures this runs once when the component mounts

    const handleBoxClick = (doctor) => {
        navigate(`/doctor/${doctor.doctorId}`); // Make sure it's 'doctorId' here
    };

    return (
        <>
            <div style={{ marginBottom: "20px" }}>
                <StyledLink to="/DoctorProfile">Doctor Profile</StyledLink>
                <StyledLink to="/PatientList">Patient List</StyledLink>
                <StyledLink to="/DoctorEntryForm">Doctor Form</StyledLink>
                <StyledLink to="/AssignPatientForm">Assign Patient To Doctor</StyledLink>
            </div>
            <div className="box-container">
                {doctorInfo.map((doctor, index) => (
                    <div
                        key={index}
                        style={{
                            backgroundColor: getBackgroundColor(doctor.specialization),
                            cursor: "pointer",
                            padding: "10px",
                            margin: "10px",
                            borderRadius: "8px",
                            textAlign: "center",
                        }}
                        onClick={() => handleBoxClick(doctor)} // On click navigate to the doctor detail
                    >
                        <Link to={`/doctor/${doctor.doctorId}`} style={{ textDecoration: "none", color: "inherit" }}>
                            <img
                                src={getImageUrl(doctor.specialization)}
                                alt={doctor.specialization}
                                style={{ width: "100px", height: "100px", borderRadius: "8px", marginBottom: "10px" }}
                            />
                            <h3>{doctor.name}</h3>
                        </Link>
                        <p>Specialization: {doctor.specialization}</p>
                        <p>Experience: {doctor.experience} years</p>
                    </div>
                ))}
            </div>
        </>
    );
};

export default Doctor;
