import React from "react";
import styled from "styled-components";

const StyledBox = styled.div`
  padding: 20px;
  background-color: ${(props) => props.backgroundColor || "#ffffff"};
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  text-align: center;
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: ${(props) => props.direction || "column"};
  gap: 16px;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    filter: blur(10px);
    z-index: -1;
    box-shadow: 0 0 15px 15px rgba(0, 255, 255, 0.5);
    background: linear-gradient(135deg, #ff9a9e, #fad0c4);
  }
`;

export const Box = ({ children, backgroundColor, direction }) => {
  return (
    <StyledBox backgroundColor={backgroundColor} direction={direction}>
      {children}
    </StyledBox>
  );
};
