import React from "react";
import SvgIcon from "../common/SvgIcon";
import styled from "styled-components";
import LeftArrowSrc from "../../assets/images/left_arrow.svg";
function Back({ onClick }) {
  return (
    <ImgBtn onClick={onClick}>
      <SvgIcon src={LeftArrowSrc} size="45px" />
    </ImgBtn>
  );
}

const ImgBtn = styled.div`
  position: absolute;
  top: 5%;
  left: 5%;

  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  width: 50px;
  height: 50px;

  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;
export default Back;
