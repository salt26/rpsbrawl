import React from "react";
import SvgIcon from "../common/SvgIcon";
import styled from "styled-components";
import RefreshSrc from "../../assets/images/refresh.svg";
function RefreshBtn({ onClick }) {
  return (
    <ImgBtn onClick={onClick}>
      <SvgIcon src={RefreshSrc} size="25px" />
    </ImgBtn>
  );
}

const ImgBtn = styled.div`
  display: flex;

  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  width: 35px;
  height: 35px;

  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;
export default RefreshBtn;
