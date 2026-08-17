import React, { useState } from "react";
import "../CompStyles/form.css"; // Import the external CSS file

const DoctorEntryForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experience: 0,
  });
  const [message, setMessage] = useState("");

  const specializations = [
    "Cardiologist",
    "Neurologist",
    "Orthopedic",
    "Pediatrician",
    "General Physician",
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataCopy = {
      ...formData,
      experience: parseInt(formData.experience),
    }; // Ensure experience is a number

    try {
      const response = await fetch("http://localhost:8000/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataCopy),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Doctor added successfully!");
        setFormData({
          name: "",
          specialization: "",
          experience: 0,
        });
      } else {
        setMessage(data.error || "Error adding doctor");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("Error connecting to the server");
    }
  };

  return (
    <div className="form-container-wrapper">
      <form className="doctor-entry-form" onSubmit={handleSubmit}>
        <h2>Add New Doctor</h2>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter Doctor's Name"
            required
          />
        </label>

        <label>
          Specialization:
          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Specialization</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </label>

        <label>
          Experience (in years):
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            min="1"
            placeholder="Experience in Years"
            required
          />
        </label>

        <button type="submit" className="submit-btn">Add Doctor</button>
        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
};

export default DoctorEntryForm;
