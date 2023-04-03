import React from "react";
import styled from "styled-components";
import { Medium } from "../../styles/font";
import { css } from "styled-components";
import palette from "../../styles/palette";
const getNameSize = (name) => {
  if (name.length <= 10) {
    return "25px";
  } else if (name.length <= 20) {
    return "20px";
  } else {
    return "15px";
  }
};

function MyNameTag({ children, size, none, color }) {
  return (
    <Container size={size} none={none} bg={palette[color]}>
      <Medium size={getNameSize(children)} color={"white"}>
        {children}
      </Medium>
    </Container>
  );
}

const sizes = {
  s: {
    width: "130px",
    height: "50px",
  },
  m: {
    width: "250px",
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
      @media (max-width: 767px) {
        //모바일
        position: absolute;
        right: 10%;
        bottom: 5%;
      }
      @media (min-width: 1200px) {
        // 데스크탑 일반
        position: absolute;
        left: 80%;
        top: 5%;
      }
    `};

  width: ${({ size }) => sizes[size].width};
  height: ${({ size }) => sizes[size].height};

  background-image: ${({ bg }) =>
    bg ? bg : "linear-gradient(180deg, #fac215 0%, #f97916 100%);"};

  border-radius: 10px;
`;

export default MyNameTag;
