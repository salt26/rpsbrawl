import React from "react";
import styled from "styled-components";

const Btn = styled.button`
  background-color: ${({ bgColor }) => (bgColor ? bgColor : "var(--mint)")};
  border: none;
  z-index: 1;
  cursor: pointer;
  border-radius: 50px;
  width: ${({ width }) => (width ? width : "150px")};
  height: ${({ height }) => (height ? height : "50px")};
  color: white;
  font-size: 25px;
  letter-spacing: 2px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  font-family: "KOTRAHOPE";
  background: ${({ bg }) =>
    bg
      ? bg
      : "linear-gradient(180deg, #3ab6bc 0%, #3a66bc 100%, #2f508e 100%)"};
  &:hover {
    background-color: var(--light-mint);
    transform: scale(1.1);
  }
`;
export default function Button({ text, onClick, width, height, bg }) {
  return (
    <Btn bg={bg} width={width} height={height} onClick={onClick}>
      {text}
    </Btn>
  );
}
