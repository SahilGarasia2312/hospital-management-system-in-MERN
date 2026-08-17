import React, { useState, useContext } from "react";
import { DoctorContext } from "../DoctorContextProvider";
import "../CompStyles/EditDoctorProfileForm.css"; // Import the external CSS

const EditDoctorProfileForm = () => {
  const { doctor, updateDoctorDetails } = useContext(DoctorContext);

  // State for form input values, pre-filled with current doctor details
  const [formValues, setFormValues] = useState({
    name: doctor.name,
    specialization: doctor.specialization,
    experience: doctor.experience,
    email: doctor.email,
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    updateDoctorDetails(formValues); // Update context with the new doctor details
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h2 className="form-title">Edit Doctor Profile</h2>
      <div className="label">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formValues.name}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div className="label">
        <label htmlFor="specialization">Specialization:</label>
        <input
          type="text"
          id="specialization"
          name="specialization"
          value={formValues.specialization}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div className="label">
        <label htmlFor="experience">Experience (years):</label>
        <input
          type="number"
          id="experience"
          name="experience"
          value={formValues.experience}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div className="label">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formValues.email}
          onChange={handleChange}
          className="input"
        />
      </div>
      <button type="submit" className="button">
        Save Changes
      </button>
    </form>
  );
};

export default EditDoctorProfileForm;
