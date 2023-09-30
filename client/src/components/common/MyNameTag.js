import React from "react";
import styled from "styled-components";
import { Medium } from "../../styles/font";
import { css } from "styled-components";
import palette from "../../styles/palette";

function MyNameTag({ children, size, none, color }) {
  return (
    <Container bg={palette[color]}>
      <Medium size={"25px"} color={"white"}>
        {children}
      </Medium>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 200px;
  padding: 10px 30px;
  box-sizing: border-box;

  background-image: ${({ bg }) =>
    bg ? bg : "linear-gradient(180deg, #fac215 0%, #f97916 100%);"};

  border-radius: 10px;
`;

export default MyNameTag;
