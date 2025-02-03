// StyledComponents.js
import styled from "styled-components";

export const MainContent = styled.div `
  display: flex;
  flex-wrap: wrap;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  padding: 20px;
  overflow-y: auto;
  height: 100vh;
`;

export const AppContainer = styled.div `
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background: linear-gradient(90deg, #9ddff1, #10aba5);
  overflow: scroll;
`;