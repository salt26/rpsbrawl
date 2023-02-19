import React from "react";
import styled from "styled-components";
import { Medium } from "../../styles/font";
import { css } from "styled-components";

function MyNameTag({ children, size, none }) {
  const fontsize = {
    s: "25px",
    m: "35px",
  };
  return (
    <Container size={size} none={none}>
      <Medium size={fontsize[size]} color={"white"}>
        {children}
      </Medium>
    </Container>
  );
}

const sizes = {
  s: {
    width: "150px",
    height: "50px",
  },
  m: {
    width: "200px",
    height: "60px",
  },
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  box-sizing: border-box;
  ${({ none }) =>
    !none &&
    css`
      position: absolute;
      left: 80%;
      top: 5%;
    `};

  width: ${({ size }) => sizes[size].width};
  height: ${({ size }) => sizes[size].height};

  background-image: linear-gradient(180deg, #fac215 0%, #f97916 100%),
    linear-gradient(to right, red 0%, orange 100%);
  background-origin: border-box;
  background-clip: content-box, border-box;

  border: 1px solid #f99f15;
  border-radius: 10px;
`;

export default MyNameTag;
