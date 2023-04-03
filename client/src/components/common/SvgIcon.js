import React from "react";
import styled from "styled-components";
import { css } from "styled-components";

const SvgIcon = ({ src, size, color, width, height, onClick }) => {
  return (
    <IconContainer onClick={onClick}>
      <img
        src={src}
        width={width ? width : size}
        height={height ? height : size}
      />
    </IconContainer>
  );
};

export default SvgIcon;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ onClick }) =>
    onClick &&
    css`
      filter: brightness(1);
      &:hover {
        filter: brightness(0.1);
        cursor: pointer;
      }
    `}
`;
