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
import { WebsocketContext } from "../../utils/WebSocketProvider";
import { useMediaQuery } from "react-responsive";

function AddBot({ skilledBot, dumbBot }) {
  const [createSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 불러오기
  const isMobile = useMediaQuery({ query: "(max-width:768px)" });

  const _changeNumOfBot = (type, num) => {
    let request = {
      request: "setting",
      bot_skilled: type === "skilled" ? num : skilledBot, // 0 이상 10 이하
      bot_dumb: type === "dumb" ? num : dumbBot, // 0 이상 10 이하
    };

    ws.send(JSON.stringify(request));
    console.log("봇변경 요청이 발송되었습니다.");
  };
  const mode = useContext(LanguageContext);

  const _addSkilledBot = () => {
    if (skilledBot >= 10) {
      alert("Cannot add more bots");
      return;
    }
    _changeNumOfBot("skilled", skilledBot + 1);
    // setSkilledBot((prev) => prev + 1);
  };

  const _deductSkilledBot = () => {
    if (skilledBot <= 0) {
      alert("Cannot reduce the number of bots.");
      return;
    }
    _changeNumOfBot("skilled", skilledBot - 1);
    //setSkilledBot((prev) => prev - 1);
  };

  const _addDumbBot = () => {
    if (dumbBot >= 10) {
      alert("Cannot add more bots");
      return;
    }

    _changeNumOfBot("dumb", dumbBot + 1);
    //setDumbBot((prev) => prev + 1);
  };

  const _deductDumbBot = () => {
    if (dumbBot <= 0) {
      alert("Cannot reduce the number of bots");
      return;
    }
    _changeNumOfBot("dumb", dumbBot - 1);
    //setDumbBot((prev) => prev - 1);
  };
  return (
    <div style={{ display: isMobile ? "none" : "block" }}>
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

              <SvgIcon
                src={RightArrowSrc}
                size="25px"
                onClick={_addSkilledBot}
              />
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
              <SvgIcon
                src={LeftArrowSrc}
                size="25px"
                onClick={_deductDumbBot}
              />
              <Medium color="white" size="35px">
                {dumbBot}
              </Medium>
              <SvgIcon src={RightArrowSrc} size="25px" onClick={_addDumbBot} />
            </Row>
          </BotBox>
        </Col>
      </BgBox>
    </div>
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
