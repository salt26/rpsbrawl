import React from "react";
import styled from "styled-components";

const BgBox = styled.div`
  width: ${({ width }) => (width ? width : "120px")};
  height: ${({ height }) => (height ? height : "120px")};
  background-color: ${({ bgColor }) => (bgColor ? bgColor : "white")};
  border-radius: 10px;
`;
export default BgBox;
