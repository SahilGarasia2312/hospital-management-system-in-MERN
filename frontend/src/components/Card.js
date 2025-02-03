import React from "react";
import styled from "styled-components";

// Styled-components
const CardContainer = styled.div`
  background-color: white;
  height: 50vh;
  width: 300px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(50, 0, 0, 0.3), 0 8px 30px rgba(70, 0, 60, 0.4);
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  font-family: Arial, Helvetica, sans-serif;
`;

const HorizontalRule = styled.hr`
  width: 100%;
`;

// const SocialContainer = styled.div`
//   display: flex;
//   justify-content: center;
//   gap: 15px;
//   margin-top: 20px;
// `;

// const SocialLink = styled.a`
//   text-decoration: none;
//   color: #333;
//   font-size: 1.5rem;
//   transition: color 0.3s ease;

//   &:hover {
//     color: #007bff;
//   }
// `;

// React component
const Card = ({ Pname, age, gender, disease }) => {
  return (
    <CardContainer>
      <ProfileImage src="../assets/petient.png" alt="Profile-Icon" />
      <Title>{Pname}</Title>
      <HorizontalRule />
      <p>Age: {age}</p>
      <p>Gender: {gender}</p>
      <p>Disease: {disease}</p>
    </CardContainer>
  );
};

export default Card;
