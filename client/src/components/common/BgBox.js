import React from "react";
import styled from "styled-components";

const BgBox = styled.div`
  width: ${({ width }) => (width ? width : "100%")};
  height: ${({ height }) => (height ? height : "auto")};
  background-color: ${({ bgColor }) => (bgColor ? bgColor : "white")};
  border-radius: 10px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;
export default BgBox;
