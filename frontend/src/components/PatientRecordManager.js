import React, { useState, useEffect } from "react";
import styled from "styled-components";

// Main component to manage patient records
const PatientRecordManager = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "male",
    diagnosis: "",
    contact: "",
    weight: "",
    disease: "",
    symptoms: "",
    medicine_prescribed: "",
    visited_date: "",
    indoor_outdoor: "Indoor",
    admitted_date: "",
    relieving_date: "",
    relieving_summary: "",
  });

  // Fetch patient data when the component mounts
  useEffect(() => {
    setTimeout(() => {
      fetch("https://api.jsonbin.io/v3/b/671a064dad19ca34f8bdb7e0")
        .then((response) => response.json())
        .then((data) => {
          setPatients(data.record); // Assumes `record` contains the array of patient details
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching patient data:", error);
          setLoading(false);
        });
    }, 1000); // Simulated network delay of 1 second
  }, []);

  // Handle form input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewPatient((prevPatient) => ({
      ...prevPatient,
      [name]: value,
    }));
  };

  // Handle form submission to add a new patient
  const handleFormSubmit = (event) => {
    event.preventDefault();
    setPatients((prevPatients) => [...prevPatients, newPatient]);
    // Reset form after submission
    setNewPatient({
      name: "",
      age: "",
      gender: "male",
      diagnosis: "",
      contact: "",
      weight: "",
      disease: "",
      symptoms: "",
      medicine_prescribed: "",
      visited_date: "",
      indoor_outdoor: "Indoor",
      admitted_date: "",
      relieving_date: "",
      relieving_summary: "",
    });
  };

  return (
    <Container>
      <Heading>Patient Record Manager</Heading>
      <ContentWrapper>
        <FormContainer>
          <h3>Add New Patient</h3>
          <Form onSubmit={handleFormSubmit}>
            <Label>
              Name:
              <Input
                type="text"
                name="name"
                value={newPatient.name}
                onChange={handleInputChange}
                required
              />
            </Label>

            <Label>
              Age:
              <Input
                type="number"
                name="age"
                value={newPatient.age}
                onChange={handleInputChange}
                required
                min="0"
              />
            </Label>

            <Label>
              Gender:
              <Select
                name="gender"
                value={newPatient.gender}
                onChange={handleInputChange}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </Label>

            <Label>
              Weight:
              <Input
                type="number"
                name="weight"
                value={newPatient.weight}
                onChange={handleInputChange}
                required
                min="0"
              />
            </Label>

            <Label>
              Disease:
              <Input
                type="text"
                name="disease"
                value={newPatient.disease}
                onChange={handleInputChange}
                required
              />
            </Label>

            <Label>
              Symptoms:
              <Input
                type="text"
                name="symptoms"
                value={newPatient.symptoms}
                onChange={handleInputChange}
                required
              />
            </Label>

            <Label>
              Medicine Prescribed:
              <Input
                type="text"
                name="medicine_prescribed"
                value={newPatient.medicine_prescribed}
                onChange={handleInputChange}
                required
              />
            </Label>

            <Label>
              Visited Date:
              <Input
                type="date"
                name="visited_date"
                value={newPatient.visited_date}
                onChange={handleInputChange}
                required
              />
            </Label>

            <Label>
              Indoor/Outdoor:
              <Select
                name="indoor_outdoor"
                value={newPatient.indoor_outdoor}
                onChange={handleInputChange}
                required
              >
                <option value="Indoor">Indoor</option>
                <option value="Outdoor">Outdoor</option>
              </Select>
            </Label>

            <Label>
              Admitted Date:
              <Input
                type="date"
                name="admitted_date"
                value={newPatient.admitted_date}
                onChange={handleInputChange}
              />
            </Label>

            <Label>
              Relieving Date:
              <Input
                type="date"
                name="relieving_date"
                value={newPatient.relieving_date}
                onChange={handleInputChange}
              />
            </Label>

            <Label>
              Relieving Summary:
              <Textarea
                name="relieving_summary"
                value={newPatient.relieving_summary}
                onChange={handleInputChange}
                required
              />
            </Label>

            <SubmitButton type="submit">Add Patient</SubmitButton>
          </Form>
        </FormContainer>

        {loading ? (
          <LoadingMessage>Loading patient data...</LoadingMessage>
        ) : (
          <PatientListContainer>
            <PatientListHeading>Patient List</PatientListHeading>
            <PatientList>
              {patients.map((patient, index) => (
                <PatientItem key={index}>
                  <PatientDetail>
                    <strong>Name:</strong> {patient.name}
                  </PatientDetail>
                  <PatientDetail>
                    <strong>Age:</strong> {patient.age}
                  </PatientDetail>
                  <PatientDetail>
                    <strong>Gender:</strong> {patient.gender}
                  </PatientDetail>
                  <PatientDetail>
                    <strong>Diagnosis:</strong> {patient.diagnosis}
                  </PatientDetail>
                  <PatientDetail>
                    <strong>Contact:</strong> {patient.contact}
                  </PatientDetail>
                  <PatientDetail>
                    <strong>Weight:</strong> {patient.weight}
                  </PatientDetail>
                  <PatientDetail>
                    <strong>Disease:</strong> {patient.disease}
                  </PatientDetail>
                  <PatientDetail>
                    <strong>Symptoms:</strong> {patient.symptoms}
                  </PatientDetail>
                  <PatientDetail>
                    <strong>Medicine Prescribed:</strong>{" "}
                    {patient.medicine_prescribed}
                  </PatientDetail>
                  <PatientDetail>
                    <strong>Visited Date:</strong> {patient.visited_date}
                  </PatientDetail>
                  <PatientDetail>
                    <strong>Indoor/Outdoor:</strong> {patient.indoor_outdoor}
                  </PatientDetail>
                  <PatientDetail>
                    <strong>Admitted Date:</strong> {patient.admitted_date}
                  </PatientDetail>
                  <PatientDetail>
                    <strong>Relieving Date:</strong> {patient.relieving_date}
                  </PatientDetail>
                  <PatientDetail>
                    <strong>Relieving Summary:</strong>{" "}
                    {patient.relieving_summary}
                  </PatientDetail>
                </PatientItem>
              ))}
            </PatientList>
          </PatientListContainer>
        )}
      </ContentWrapper>
    </Container>
  );
};

export default PatientRecordManager;

// Styled components

const Container = styled.div`
  padding: 20px;
  background-color: #f4f4f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  width: 80%;
  max-width: 1200px;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-grow: 1;
  overflow-y: auto;
`;

const Heading = styled.h2`
  text-align: center;
  font-size: 2rem;
  color: #333;
`;

const LoadingMessage = styled.p`
  text-align: center;
  font-size: 1.5rem;
  color: #888;
`;

const PatientListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const PatientListHeading = styled.h3`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 10px;
`;

const PatientList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const PatientItem = styled.li`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  padding: 12px;
  margin: 10px 0;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PatientDetail = styled.div`
  font-size: 1rem;
  color: #333;
  line-height: 1.5;
`;

const FormContainer = styled.div`
  flex: 1;
  max-width: 400px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 600px;
  margin: 0 auto;
`;

const Label = styled.label`
  font-size: 1rem;
  margin: 10px 0 5px;
  color: #333;
`;

const Input = styled.input`
  padding: 8px;
  font-size: 1rem;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
`;

const Select = styled.select`
  padding: 8px;
  font-size: 1rem;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
`;

const Textarea = styled.textarea`
  padding: 8px;
  font-size: 1rem;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
  height: 100px;
`;

const SubmitButton = styled.button`
  background: linear-gradient(
    to right,
    #4caf50,
    #f44336
  ); /* Green to Red gradient */
  color: white;
  font-size: 1rem;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  transition: background 0.3s ease; /* Smooth transition for hover effect */

  &:hover {
    background: linear-gradient(
      to right,
      #45a049,
      #e53935
    ); /* Darker Green to Darker Red on hover */
  }
`;
