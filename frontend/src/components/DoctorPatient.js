import React, { useContext } from "react";
import { DoctorContext } from "../DoctorContextProvider";
import {
  PatientListContainer,
  PatientListTitle,
  PatientItem,
  PatientDetails,
} from "./styled/StyledComponents";

const DoctorPatientOverview = () => {
  const { doctors } = useContext(DoctorContext);

  return (
    <PatientListContainer>
      <PatientListTitle>Doctor-Patient Overview</PatientListTitle>
      {doctors.map((doctor) => (
        <div key={doctor.id}>
          <h3>
            {doctor.name} - {doctor.specialization}
          </h3>
          <ul>
            {doctor.patients.map((patient, index) => (
              <PatientItem key={index}>
                <PatientDetails>
                  <strong>{patient.Pname}</strong> ({patient.age} years old)
                </PatientDetails>
                <PatientDetails>Disease: {patient.disease}</PatientDetails>
                <PatientDetails>
                  Status: {patient.admissionStatus}
                </PatientDetails>
                {patient.admissionStatus === "Indoor" && (
                  <>
                    <PatientDetails>
                      Admitted Date: {patient.admittedDate}
                    </PatientDetails>
                    <PatientDetails>
                      Releasing Date: {patient.releasingDate}
                    </PatientDetails>
                    <PatientDetails>
                      Summary: {patient.releasingSummary}
                    </PatientDetails>
                  </>
                )}
              </PatientItem>
            ))}
          </ul>
        </div>
      ))}
    </PatientListContainer>
  );
};

export default DoctorPatientOverview;
