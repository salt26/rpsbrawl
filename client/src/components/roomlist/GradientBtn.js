import React from "react";
import styled from "styled-components";
import { Medium } from "../../styles/font";
import { css } from "styled-components";
function GradientBtn({ text, onClick, style, anim, disabled }) {
  const { width, height, bg, borderRadius, fontSize } = style;
  return (
    <Box
      width={width}
      height={height}
      bg={bg}
      onClick={onClick}
      borderRadius={borderRadius}
      anim={anim}
      disabled={disabled}
    >
      <Medium size={fontSize ? fontSize : "20px"} color="white">
        {text}
      </Medium>
    </Box>
  );
}

const Box = styled.div`
  width: ${({ width }) => (width ? width : "120px")};
  height: ${({ height }) => (height ? height : "120px")};
  background: ${({ bg }) => (bg ? bg : "none")};
  border-radius: ${({ borderRadius }) =>
    borderRadius ? borderRadius : "10px"};
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  ${({ disabled }) =>
    disabled ||
    css`
      cursor: pointer;
    `}

  transition: all 0.1s linear;

  ${({ anim }) =>
    anim &&
    css`
      &:hover {
        transform: scale(1.1);
      }
    `}
`;
export default GradientBtn;
