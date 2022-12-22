import React from "react";
import styled from "styled-components";

const Btn = styled.button`
  background-color: ${({ bgColor }) => (bgColor ? bgColor : "var(--mint)")};
  border: none;
  cursor: pointer;
  border-radius: 50px;
  width: ${({ width }) => (width ? width : "150px")};
  height: ${({ height }) => (height ? height : "50px")};
  color: white;
  font-size: 20px;
  letter-spacing: 2px;
  font-family: "KOTRAHOPE";
  &:hover {
    background-color: var(--light-mint);
  }
`;
export default function Button({ text, onClick, width, height, bgColor }) {
  return (
    <Btn bgColor={bgColor} width={width} height={height} onClick={onClick}>
      {text}
    </Btn>
  );
}
