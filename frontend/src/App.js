import "./App.css";
import { Navbar } from "./components/Navbar";
import Home from "./components/Home";
import Patient from "./components/Patient";
import { Routes, Route } from "react-router-dom";
import PatientRecordManager from "./components/PatientRecordManager";
import Doctor from "./components/Doctor";
import DoctorEntryForm from "./components/DoctorEntryForm";
import DoctorDetail from "./components/DoctorDetail";
import { DoctorContextProvider } from "./DoctorContextProvider";
import AssignPatientForm from "./components/AssignPatientForm";
import DoctorProfile from "./components/DoctorProfile";
import PatientList from "./components/PatientList";
import EditDoctor from "./components/EditDoctor"
function App() {
  const doctorInfo = [
    { Dname: "Dr. Arjun Sharma", specialization: "Cardiologist", experience: 15 },
    { Dname: "Dr. Priya Singh", specialization: "Neurologist", experience: 12 },
    { Dname: "Dr. Rakesh Mehta", specialization: "Orthopaedist", experience: 10 },
    { Dname: "Dr. Neha Gupta", specialization: "Pediatrician", experience: 8 },
    { Dname: "Dr. Vikram Rao", specialization: "Cardiologist", experience: 18 },
  ];

  const patientInfo = [
    { Pname: 123, age: "abc", gender: "Male", disease: 1234 },
    { Pname: 3434, age: "sahil", gender: "Male", disease: 123 },
    { Pname: "Asmita Patel", age: 40, gender: "Female", disease: "Fibromyalgia" },
    { Pname: "Avani Patel", age: 50, gender: "Female", disease: "Arthritis" },
    { Pname: "Mayur Patel", age: 45, gender: "Male", disease: "Asthma" },
  ];

  return (
    <DoctorContextProvider>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/Doctor" element={<Doctor doctorInfo={doctorInfo} />} />
          <Route exact path="/Patient" element={<Patient patientInfo={patientInfo} />} />
          <Route exact path="/PatientRecordManager" element={<PatientRecordManager />} />
          <Route exact path="/DoctorProfile" element={<DoctorProfile />} />
          <Route exact path="/PatientList" element={<PatientList />} />
          <Route exact path="/AssignPatientForm" element={<AssignPatientForm />} />
          <Route exact path="/DoctorEntryForm" element={<DoctorEntryForm />} />
          <Route path="/doctor/:doctorId" element={<DoctorDetail />} />
          <Route path="/doctor/:doctorId" element={<EditDoctor />} />

        </Routes>
      </div>
    </DoctorContextProvider>
  );
}

export default App;
