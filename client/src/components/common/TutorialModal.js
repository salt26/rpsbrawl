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
import styled, { css } from "styled-components";
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
    "linear-gradient(180deg, #2590A6 0%, #3A66BC 100%, #2F508E 100%);";
  const content = [
    <Col>
      <LogoBox>{isMobile ? <Logo size="s" /> : <Logo size="m" />}</LogoBox>
      <GradientText bg={blueGradient} size="var(--font-size-lg)">
        {Language[mode].tutorial[0]}
      </GradientText>
      <Detail size="var(--font-size-ms)" color="var(--background)">
        {isMobile === false && (
          <>
            {Language[mode].tutorial_details[0][0]}
            <br />
          </>
        )}
        {Language[mode].tutorial_details[0][1]}
        <br />
        {Language[mode].tutorial_details[0][2]}
        <br />
        {Language[mode].tutorial_details[0][3]}
        <br />
        {Language[mode].tutorial_details[0][4]}
      </Detail>
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="var(--font-size-lg)">
        {Language[mode].tutorial[1]}
      </GradientText>
      <Box>
        <SvgIcon src={Step1Src} width="300px" />
        <Detail size="var(--font-size-ms)" color="var(--background)">
          {Language[mode].tutorial_details[1]}
        </Detail>
      </Box>
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="var(--font-size-lg)">
        {Language[mode].tutorial[2]}
      </GradientText>
      <Box>
        <SvgIcon src={Step2Src} width="300px" />
        <Detail size="var(--font-size-ms)" color="var(--background)">
          {Language[mode].tutorial_details[2]}
        </Detail>
      </Box>
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="var(--font-size-lg)">
        {Language[mode].tutorial[3]}
      </GradientText>
      <Box>
        <SvgIcon src={Step3Src} width="300px" />
        <Detail size="var(--font-size-ms)" color="var(--background)">
          {Language[mode].tutorial_details[3]}
        </Detail>
      </Box>
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="var(--font-size-lg)">
        {Language[mode].tutorial[4]}
      </GradientText>
      <Box>
        <SvgIcon src={Step4Src} width="300px" />
        <Detail size="var(--font-size-ms)" color="var(--background)">
          {Language[mode].tutorial_details[4]}
        </Detail>
      </Box>
    </Col>,
    <Col>
      <GradientText bg={blueGradient} size="var(--font-size-lg)">
        {Language[mode].tutorial[5]}
      </GradientText>

      <SvgIcon src={Step5Src} width="100px" height={"auto"} />
      <Detail size="var(--font-size-ms)" color="var(--background)">
        {Language[mode].tutorial_details[5]}
      </Detail>
    </Col>,
    <Col isMobile={isMobile}>
      <GradientText bg={blueGradient} size="var(--font-size-lg)">
        {Language[mode].tutorial[6]}
      </GradientText>

      <Box>
        <SvgIcon src={Step6Src} width="200px" />
        <Detail size="var(--font-size-ms)" color="var(--background)">
          {Language[mode].tutorial_details[6]}
        </Detail>
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
      <Scroll key={currentTabIdx}>{content[currentTabIdx]}</Scroll>
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
  z-index: 1;
  cursor: pointer;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
  align-items: center;
  width: 100%;
  margin: auto; // 내용이 짧으면 가운데, 길면 위에서부터 보이도록

  img {
    max-width: 100%;
  }
`;

const LogoBox = styled.div`
  img {
    max-height: 30vh;
    object-fit: contain;
  }
`;

const Detail = styled(MediumOutline)`
  -webkit-text-stroke: 0;
  text-shadow: none;
  line-height: 1.8;
`;

const Scroll = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  overflow: hidden auto;
  padding: 40px 12%;
  scrollbar-color: #8f8bd0 transparent; // Firefox

  &::-webkit-scrollbar-thumb {
    background: #8f8bd0;
  }

  @media (max-width: 767px) {
    //모바일 (아래쪽은 화살표 자리)
    inset: 48px 0 64px 0;
    padding: 12px 20px 40px;
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
// 이미지가 옅은 회색이라 밝은 배경에서 잘 보이도록 진하게
const arrow = css`
  img {
    filter: brightness(0.45) drop-shadow(0 0 0 #524fa1)
      drop-shadow(0 0 0 #524fa1);
  }

  @media (max-width: 767px) {
    //모바일
    top: auto;
    bottom: 17px;
  }
`;

const Right = styled.div`
  position: absolute;
  right: 5%;
  top: 50%;
  z-index: 1;
  cursor: pointer;
  ${arrow}
`;
const Left = styled.div`
  position: absolute;
  left: 5%;
  top: 50%;
  z-index: 1;
  cursor: pointer;
  ${arrow}
`;
