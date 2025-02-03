import React, { useState, useContext } from "react";
import { DoctorContext } from "../DoctorContextProvider";
import styled from "styled-components";
import EditDoctorProfileForm from "./EditDoctorProfileForm ";

// Styled-components
const ProfileContainer = styled.div`
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ProfileTitle = styled.h2`
  text-align: center;
  color: #333;
  margin-bottom: 20px;
`;

const ProfileDetails = styled.p`
  font-size: 1.1rem;
  color: #555;
  margin: 10px 0;
`;

const ProfileLabel = styled.span`
  font-weight: bold;
  color: #007bff;
`;

const Button = styled.button`
  padding: 10px 15px;
  background: linear-gradient(
    45deg,
    #28a745,
    #dc3545
  ); /* Green to Red gradient */
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: linear-gradient(
      45deg,
      #218838,
      #c82333
    ); /* Darker green to red on hover */
  }
`;

const DoctorProfile = () => {
  const { doctor } = useContext(DoctorContext);
  const [isEditing, setIsEditing] = useState(false); // State to toggle between view and edit

  const toggleEditing = () => {
    setIsEditing(!isEditing); // Toggle between editing and viewing mode
  };

  return (
    <ProfileContainer>
      {isEditing ? (
        <EditDoctorProfileForm /> // Show edit form when isEditing is true
      ) : (
        <>
          <ProfileTitle>Doctor Profile</ProfileTitle>
          <ProfileDetails>
            <ProfileLabel>Name:</ProfileLabel> {doctor.name}
          </ProfileDetails>
          <ProfileDetails>
            <ProfileLabel>Specialization:</ProfileLabel> {doctor.specialization}
          </ProfileDetails>
          <ProfileDetails>
            <ProfileLabel>Experience:</ProfileLabel> {doctor.experience} years
          </ProfileDetails>
          <ProfileDetails>
            <ProfileLabel>Email:</ProfileLabel> {doctor.email}
          </ProfileDetails>
        </>
      )}
      <Button onClick={toggleEditing}>
        {isEditing ? "Cancel Editing" : "Edit Profile"}{" "}
        {/* Button text changes based on state */}
      </Button>
    </ProfileContainer>
  );
};

export default DoctorProfile;

// import React, { useContext } from "react";
// import { DoctorContext } from "../DoctorContextProvider";
// import styled from "styled-components";

// // Styled-components
// const ProfileContainer = styled.div
//   max-width: 600px;
//   margin: 20px auto;
//   padding: 20px;
//   background-color: #f9f9f9;
//   border-radius: 8px;
//   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
// ;

// const ProfileTitle = styled.h2
//   text-align: center;
//   color: #333;
//   margin-bottom: 20px;
// ;

// const ProfileDetails = styled.p
//   font-size: 1.1rem;
//   color: #555;
//   margin: 10px 0;
// ;

// const ProfileLabel = styled.span
//   font-weight: bold;
//   color: #007bff;
// ;

// const DoctorProfile = () => {
//   const { doctor } = useContext(DoctorContext);

//   return (
//     <ProfileContainer>
//       <ProfileTitle>Doctor Profile</ProfileTitle>
//       <ProfileDetails>
//         <ProfileLabel>Name:</ProfileLabel> {doctor.name}
//       </ProfileDetails>
//       <ProfileDetails>
//         <ProfileLabel>Specialization:</ProfileLabel> {doctor.specialization}
//       </ProfileDetails>
//       <ProfileDetails>
//         <ProfileLabel>Experience:</ProfileLabel> {doctor.experience} years
//       </ProfileDetails>
//       <ProfileDetails>
//         <ProfileLabel>Email:</ProfileLabel> {doctor.email}
//       </ProfileDetails>
//     </ProfileContainer>
//   );
// };

// export default DoctorProfile;
