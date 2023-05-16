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
import { GradientText, Medium, MediumOutline } from "../../styles/font";

import NextIconSrc from "../../assets/images/next.png";
import BeforeIconSrc from "../../assets/images/before.png";
import SizedBox from "../common/SizedBox";
import { useContext } from "react";
import { LanguageContext } from "../../utils/LanguageProvider";
import { Language } from "../../db/Language";
import useMediaQuery from "react-responsive";
import Modal from "./Modal";

export default function TutorialModal({ modalVisible, setModalVisible }) {
  const [currentTabIdx, setCurrentTabIdx] = useState(0);
  const isMobile = useMediaQuery({ query: "(max-width:768px)" });
  const LAST_TAP_IDX = 6;
  const mode = useContext(LanguageContext);
  const blueGradient =
    "linear-gradient(180deg, #3AB6BC 0%, #3A66BC 100%, #2F508E 100%);";
  const content = [
    <Col>
      {isMobile ? <Logo size="s" /> : <Logo size="m" />}
      <GradientText bg={blueGradient} size="var(--font-size-lg)">
        {Language[mode].tutorial[0]}
      </GradientText>
      <MediumOutline size="var(--font-size-ms)" color="var(--background)">
        {isMobile === false && Language[mode].tutorial_details[0][0]}

        <br />
        {Language[mode].tutorial_details[0][1]}
        <br />
        {Language[mode].tutorial_details[0][2]}
        <br />
        {Language[mode].tutorial_details[0][3]}
        <br />
        {Language[mode].tutorial_details[0][4]}
      </MediumOutline>
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="var(--font-size-lg)">
        {Language[mode].tutorial[1]}
      </GradientText>
      <Box>
        <SvgIcon src={Step1Src} width="300px" />
        <MediumOutline size="var(--font-size-ms)" color="var(--background)">
          {Language[mode].tutorial_details[1]}
        </MediumOutline>
      </Box>
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="var(--font-size-lg)">
        {Language[mode].tutorial[2]}
      </GradientText>
      <Box>
        <SvgIcon src={Step2Src} width="300px" />
        <MediumOutline size="var(--font-size-ms)" color="var(--background)">
          {Language[mode].tutorial_details[2]}
        </MediumOutline>
      </Box>
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="var(--font-size-lg)">
        {Language[mode].tutorial[3]}
      </GradientText>
      <Box>
        <SvgIcon src={Step3Src} width="300px" />
        <MediumOutline size="var(--font-size-ms)" color="var(--background)">
          {Language[mode].tutorial_details[3]}
        </MediumOutline>
      </Box>
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="var(--font-size-lg)">
        {Language[mode].tutorial[4]}
      </GradientText>
      <Box>
        <SvgIcon src={Step4Src} width="300px" />
        <MediumOutline size="var(--font-size-ms)" color="var(--background)">
          {Language[mode].tutorial_details[4]}
        </MediumOutline>
      </Box>
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="var(--font-size-lg)">
        {Language[mode].tutorial[5]}
      </GradientText>

      <SvgIcon src={Step5Src} width="100px" height={"auto"} />
      <MediumOutline size="var(--font-size-ms)" color="var(--background)">
        {Language[mode].tutorial_details[5]}
      </MediumOutline>
    </Col>,
    <Col isMobile={isMobile}>
      <GradientText bg={blueGradient} size="var(--font-size-lg)">
        {Language[mode].tutorial[6]}
      </GradientText>

      <Box>
        <SvgIcon src={Step6Src} width="200px" />
        <MediumOutline size="var(--font-size-ms)" color="var(--background)">
          {Language[mode].tutorial_details[6]}
        </MediumOutline>
      </Box>
    </Col>,
  ];

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
    <Modal isOpen={modalVisible} closeModal={() => setModalVisible(false)}>
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
    </Modal>
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
  padding: 20px;
  align-items: center;
  height: 80%;

  @media (max-width: 767px) {
    //모바일
    overflow: hidden scroll;
    transform: scale(1vw * 0.8); // 사이즈에 비례해서 작아지도록
  }
`;

const Box = styled.div`
  display: flex;

  width: 100%;

  gap: 20px;
  align-items: center;

  @media (max-width: 767px) {
    //모바일
    flex-direction: column;
    justify-content: space-around;
    margin-top: 20px;
  }

  @media (min-width: 1200px) {
    // 데스크탑 일반
    flex-direction: row;
    justify-content: space-between;
  }
`;
const Right = styled.div`
  position: absolute;
  right: 5%;
  top: 50%;
  cursor: pointer;
`;
const Left = styled.div`
  position: absolute;
  left: 5%;
  top: 50%;
  cursor: pointer;
`;
