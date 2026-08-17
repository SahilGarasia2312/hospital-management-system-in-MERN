import React from "react";
import propType from "prop-types";
import Card from "./Card";
const Patient = ({ patientInfo }) => {
  return (
    <div className="card-container">
      {patientInfo.map((patient, index) => (
        <Card
          key={index}
          Pname={patient.Pname}
          age={patient.age}
          gender={patient.gender}
          disease={patient.disease}
        />
      ))}
    </div>
  );
};
Patient.propTypes = {
  Pname: propType.string.isRequired,
  age: propType.number.isRequired,
  disease: propType.string.isRequired,
};

export default Patient;
