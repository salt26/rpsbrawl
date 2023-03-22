import React, { useState } from "react";
import SvgIcon from "./SvgIcon";
import CancelIconSrc from "../../assets/images/cancel.svg";
import Step1Src from "../../assets/images/step1.png";
import Step2Src from "../../assets/images/step2.png";
import Step3Src from "../../assets/images/step3.png";
import Step4Src from "../../assets/images/step4.png";
import Step5Src from "../../assets/images/step5.png";
import Step6Src from "../../assets/images/step6.png";
import Logo from "./Logo";
import styled from "styled-components";
import ReactModal from "react-modal";
import { GradientText, Medium } from "../../styles/font";
import { useMediaQuery } from "react-responsive";
import NextIconSrc from "../../assets/images/next.png";
import BeforeIconSrc from "../../assets/images/before.png";
import SizedBox from "../common/SizedBox";
import { useContext } from "react";
import { LanguageContext } from "../../utils/LanguageProvider";
import { Language } from "../../db/Language";
export default function TutorialModal({ modalVisible, setModalVisible }) {
  const [currentTabIdx, setCurrentTabIdx] = useState(0);

  const LAST_TAP_IDX = 6;
  const mode = useContext(LanguageContext);
  const blueGradient =
    "linear-gradient(180deg, #3AB6BC 0%, #3A66BC 100%, #2F508E 100%);";
  const content = [
    <Col>
      <Logo size="m" />
      <GradientText bg={blueGradient} size="30px">
        {Language[mode].tutorial[0]}
      </GradientText>
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="30px">
        {Language[mode].tutorial[1]}
      </GradientText>
      <SvgIcon src={Step1Src} width="300px" />
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="30px">
        {Language[mode].tutorial[2]}
      </GradientText>
      <SvgIcon src={Step2Src} width="300px" />
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="30px">
        {Language[mode].tutorial[3]}
      </GradientText>
      <SvgIcon src={Step3Src} width="300px" />
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="30px">
        {Language[mode].tutorial[4]}
      </GradientText>
      <SvgIcon src={Step4Src} size="300px" />
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="30px">
        {Language[mode].tutorial[5]}
      </GradientText>
      <SvgIcon src={Step5Src} width="100px" height={"auto"} />
      <SizedBox height={"10%"} />
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="30px">
        {Language[mode].tutorial[6]}
      </GradientText>
      <SvgIcon src={Step6Src} width="200px" />
    </Col>,
  ];

  const isMobile = useMediaQuery({ query: "(max-width:768px)" });

  const _closeModal = () => {
    setModalVisible(false);
  };

  const _moveToNextTab = () => {
    setCurrentTabIdx((prev) => prev + 1);
  };
  const _moveToPreviousTab = () => {
    setCurrentTabIdx((prev) => prev - 1);
  };
  return (
    <ReactModal
      ariaHideApp={false}
      isOpen={modalVisible}
      style={
        isMobile
          ? {
              overlay: {
                backgroundColor: "transparent",
              },
              content: {
                width: "90vw",
                height: "35vh",
                display: "flex",

                flexDirection: "column",
                justifyContent: "space-between",

                borderRadius: "10px",
              },
            }
          : {
              overlay: {
                width: "50vw",
                height: "55vh",
                top: "25%",
                left: "25%",

                backgroundColor: "transparent",
              },
              content: {
                width: "100%",
                height: "100%",
                padding: 0,
                borderRadius: "10px",
                position: "relative",
                display: "flex",

                justifyContent: "center",
                alignItems: "center",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
              },
            }
      }
    >
      {currentTabIdx !== 0 && (
        <Left>
          <SvgIcon
            src={BeforeIconSrc}
            size="30px"
            onClick={_moveToPreviousTab}
          />
        </Left>
      )}

      {content[currentTabIdx]}

      {currentTabIdx !== LAST_TAP_IDX && (
        <Right>
          <SvgIcon src={NextIconSrc} size="30px" onClick={_moveToNextTab} />
        </Right>
      )}
      <RightTop onClick={_closeModal}>
        <SvgIcon src={CancelIconSrc} />
      </RightTop>
    </ReactModal>
  );
}

const RightTop = styled.div`
  position: absolute;
  top: 5%;
  right: 5%;
  cursor: pointer;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: "50px";
  align-items: center;
  height: 80%;
`;

const Right = styled.div`
  position: absolute;
  right: 5%;
  cursor: pointer;
`;
const Left = styled.div`
  position: absolute;
  left: 5%;
  cursor: pointer;
`;
