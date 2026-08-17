import React, { useState, useContext, useEffect } from "react";
import { DoctorContext } from "../DoctorContextProvider";

import "../CompStyles/form.css"; // Import the CSS file

const AssignPatientForm = () => {
  const { doctor } = useContext(DoctorContext);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    Pname: "",
    age: "",
    disease: "",
    admissionStatus: "",
    doctorId: "",
    admittedDate: "",
    releasingDate: "",
    releasingSummary: "",
  });

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

  useEffect(() => {
    if (doctor) {
      setFormData((prevData) => ({
        ...prevData,
        doctorId: doctor.doctorId,
      }));
    }
  }, [doctor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      formData.Pname &&
      formData.age &&
      formData.disease &&
      formData.admissionStatus &&
      formData.doctorId
    ) {
      try {
        const response = await fetch(
          `http://localhost:8000/doctors/${formData.doctorId}/patients`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.Pname,
              disease: formData.disease,
              admissionStatus: formData.admissionStatus,
              admittedDate: formData.admittedDate,
              releasingDate: formData.releasingDate,
              releasingSummary: formData.releasingSummary,
            }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          alert("Patient assigned successfully!");
          setFormData({
            Pname: "",
            age: "",
            disease: "",
            admissionStatus: "",
            doctorId: "",
            admittedDate: "",
            releasingDate: "",
            releasingSummary: "",
          });
        } else {
          alert("Error assigning patient: " + (data.error || "Unknown error"));
        }
      } catch (err) {
        console.error("Error connecting to the server", err);
        alert("Error connecting to the server");
      }
    } else {
      alert("Please fill in all required fields.");
    }
  };

  return (
    <div className="form-container-wrapper">
      <form className="form-container" onSubmit={handleSubmit}>
        <input
          className="input"
          type="text"
          name="Pname"
          placeholder="Patient Name"
          value={formData.Pname}
          onChange={handleChange}
          required
        />
        <input
          className="input"
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
        />
        <input
          className="input"
          type="text"
          name="disease"
          placeholder="Disease"
          value={formData.disease}
          onChange={handleChange}
          required
        />
        <select
          className="select"
          name="admissionStatus"
          value={formData.admissionStatus}
          onChange={handleChange}
          required
        >
          <option value="">Select Admission Status</option>
          <option value="Outdoor">Outdoor</option>
          <option value="Indoor">Indoor</option>
        </select>
        <select
          className="select"
          name="doctorId"
          value={formData.doctorId}
          onChange={handleChange}
          required
        >
          <option value="">Select Doctor</option>
          {doctors.map((doc) => (
            <option key={doc.doctorId} value={doc.doctorId}>
              {doc.name} ({doc.specialization})
            </option>
          ))}
        </select>
        {formData.admissionStatus === "Indoor" && (
          <>
            <input
              className="input"
              type="date"
              name="admittedDate"
              placeholder="Admitted Date"
              value={formData.admittedDate}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              type="date"
              name="releasingDate"
              placeholder="Releasing Date"
              value={formData.releasingDate}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              type="text"
              name="releasingSummary"
              placeholder="Releasing Summary"
              value={formData.releasingSummary}
              onChange={handleChange}
            />
          </>
        )}
        <button className="submit-btn" type="submit">
          Assign Patient
        </button>
      </form>
    </div>
  );
};

export default AssignPatientForm;
