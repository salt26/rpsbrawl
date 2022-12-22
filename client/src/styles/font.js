import styled from "styled-components";

export const Medium = styled.text`
  font-family: "KOTRAHOPE";
  font-size: ${({ size }) => (size ? size : "50px")};
  color: ${({ color }) => (color ? color : "black")};
`;
