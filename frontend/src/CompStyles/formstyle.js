import styled from "styled-components";

// Container
export const Container = styled.div `
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
`;

// Sections
export const LeftSection = styled.div `
  flex: 1;
  max-width: 45%;
`;

export const RightSection = styled.div `
  flex: 1;
  max-width: 45%;
`;

export const CenteredContainer = styled.div `
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

// Form
export const FormContainer = styled.form `
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 25px;
  border-radius: 10px;
  background-color: #f4f4f4;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
`;

export const FormTitle = styled.h2 `
  text-align: center;
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 10px;
`;

export const Label = styled.label `
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  color: #444;
  font-weight: 500;
`;

export const Input = styled.input `
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  margin-top: 5px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.2);
  }
`;

export const Button = styled.button `
  padding: 12px 18px;
  background: linear-gradient(45deg, #28a745, #dc3545);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s ease;

  &:hover {
    background: linear-gradient(45deg, #218838, #c82333);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(1);
  }
`;

// Select Dropdown
export const Select = styled.select `
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  margin-top: 5px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.2);
  }
`;

export const Option = styled.option `
  padding: 10px;
  font-size: 1rem;
`;

// Patient List
export const PatientListContainer = styled.div `
  max-width: 600px;
  margin: 20px auto;
  padding: 25px;
  background-color: #f4f4f4;
  border-radius: 10px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
`;

export const PatientListTitle = styled.h2 `
  text-align: center;
  color: #333;
  font-size: 1.5rem;
`;

export const PatientItem = styled.li `
  list-style-type: none;
  background-color: #fff;
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const PatientDetails = styled.p `
  font-size: 1rem;
  color: #555;
  margin: 5px 0;
`;

export const RemoveButton = styled.button `
  padding: 8px 12px;
  background-color: #ff4d4d;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #ff1a1a;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(1);
  }
`;