import React, { useState } from "react";
import styled, { css } from "styled-components";
import { MediumOutline } from "../styles/font";

function Toggle({ mode, setMode }) {
  const clickedToggle = () => {
    if (mode === 0) {
      setMode(1);
      localStorage.setItem("language_mode", 1);
    } else {
      setMode(0);
      localStorage.setItem("language_mode", 0);
    }
  };

  return (
    <Wrapper>
      <ToggleBtn onClick={clickedToggle} mode={mode}>
        <Circle mode={mode} />

        {mode === 0 ? (
          <MediumOutline color="white" size="25px">
            ㅤ ENG
          </MediumOutline>
        ) : (
          <MediumOutline color="white" size="25px">
            KOR ㅤ
          </MediumOutline>
        )}
      </ToggleBtn>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  z-index: 5;
  align-items: center;
  position: absolute;

  top: 3%;
  @media (max-width: 767px) {
    //모바일
    left: calc(8% + 40px);
  }
  @media (min-width: 1200px) {
    // 데스크탑 일반
    left: 3%;
  }
`;

const ToggleBtn = styled.button`
  z-index: 5;
  width: 90px;
  height: 35px;
  border-radius: 30px;
  border: none;
  cursor: pointer;

  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  transition: all 0.5s ease-in-out;
  background: ${(props) =>
    !props.mode
      ? "linear-gradient(180deg, #3ab6bc 0%, #3a66bc 100%, #2f508e 100%)"
      : "linear-gradient(180deg, #BDFF00 0%, #F1D22E 100%)"};
`;
const Circle = styled.div`
  background-color: white;
  width: 24px;
  height: 24px;
  border-radius: 50px;
  position: absolute;
  left: 10%;
  transition: all 0.5s ease-in-out;
  ${(props) =>
    props.mode &&
    css`
      transform: translate(50px, 0);
      transition: all 0.5s ease-in-out;
    `}
`;

export default Toggle;
