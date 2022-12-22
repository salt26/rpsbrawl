import React from "react";
import styled from "styled-components";

const SvgIcon = ({ src, size, color }) => {
  return (
    <IconContainer>
      <img src={src} width={size} height={size} />
    </IconContainer>
  );
};

export default SvgIcon;

const IconContainer = styled.div`
  justify-content: center;
  align-items: center;
`;
