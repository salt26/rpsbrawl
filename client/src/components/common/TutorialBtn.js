import React from "react";
import SvgIcon from "./SvgIcon";
import styled from "styled-components";
import TutorialSrc from "../../assets/images/tutorial.svg";

export default function TutorialBtn({
  tutorialModalVisible,
  setTutorialModalVisible,
}) {
  return (
    <IconContainer>
      <SvgIcon
        src={TutorialSrc}
        size="40px"
        onClick={() => setTutorialModalVisible(true)}
      />
    </IconContainer>
  );
}

const IconContainer = styled.div`
  cursor: pointer;
`;
