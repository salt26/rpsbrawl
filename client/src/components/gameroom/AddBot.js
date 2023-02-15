import React, { useState } from "react";
import BgBox from "../common/BgBox";
import { MediumOutline, Medium } from "../../styles/font";
import styled from "styled-components";
import SkilledSrc from "../../assets/images/skilled.svg";
import DumbSrc from "../../assets/images/dumb.svg";
import SvgIcon from "../common/SvgIcon";
import RightArrowSrc from "../../assets/images/right-arrow.svg";
import LeftArrowSrc from "../../assets/images/left-arrow.svg";
import { LanguageContext } from "../../utils/LanguageProvider";
import { useContext } from "react";
import { Language } from "../../db/Language";
function AddBot({}) {
  const [skilledBot, setSkilledBot] = useState(5);
  const [dumbBot, setDumbBot] = useState(10);

  const mode = useContext(LanguageContext);

  const _addSkilledBot = () => {
    setSkilledBot((prev) => prev + 1);
  };

  const _deductSkilledBot = () => {
    setSkilledBot((prev) => prev - 1);
  };

  const _addDumbBot = () => {
    setDumbBot((prev) => prev + 1);
  };

  const _deductDumbBot = () => {
    setDumbBot((prev) => prev - 1);
  };
  return (
    <BgBox bgColor={"var(--light-purple)"} width="150px" height="400px">
      <TextContainer>
        <MediumOutline color="#6E3D9D" size={"40px"}>
          {Language[mode].add_bot}
        </MediumOutline>
      </TextContainer>
      <Col>
        <BotBox>
          <Medium color="white" size="30px">
            {Language[mode].skilled}
          </Medium>
          <BgBox bgColor={"white"} width="130px" height="50px">
            <Anim>
              <SvgIcon src={SkilledSrc} size="40px" />
            </Anim>
          </BgBox>
          <Row>
            <SvgIcon
              src={LeftArrowSrc}
              size="25px"
              onClick={_deductSkilledBot}
            />
            <Medium color="white" size="35px">
              {skilledBot}
            </Medium>

            <SvgIcon src={RightArrowSrc} size="25px" onClick={_addSkilledBot} />
          </Row>
        </BotBox>
        <BotBox>
          <Medium color="white" size="30px">
            {Language[mode].dumb}
          </Medium>
          <BgBox bgColor={"white"} width="130px" height="50px">
            <Anim>
              <SvgIcon src={DumbSrc} size="40px" />
            </Anim>
          </BgBox>
          <Row>
            <SvgIcon src={LeftArrowSrc} size="25px" onClick={_deductDumbBot} />
            <Medium color="white" size="35px">
              {dumbBot}
            </Medium>
            <SvgIcon src={RightArrowSrc} size="25px" onClick={_addDumbBot} />
          </Row>
        </BotBox>
      </Col>
    </BgBox>
  );
}
const TextContainer = styled.div`
  position: absolute;
  z-index: 1;
  align-self: center;
  top: -8px;
`;

const Anim = styled.div`
  animation: ani 1s infinite alternate;
  @keyframes ani {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(0, -5px);
    }
  }
`;
const Col = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
`;

const BotBox = styled.div`
  flex: 0.3;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
  justify-content: center;
`;
export default AddBot;
