/*계정 접속, 로그인*/

import React, { useState } from "react";
import styled from "styled-components";
import Logo from "../components/common/Logo";
import BgBox from "../components/common/BgBox";
import RockSrc from "../assets/images/rock.png";
import ScissorSrc from "../assets/images/scissor.png";
import PaperSrc from "../assets/images/paper.png";
import SvgIcon from "../components/common/SvgIcon";
import SizedBox from "../components/common/SizedBox";
import SelectBox from "../components/common/SelectBox";
import Button from "../components/common/Button";
import { useContext } from "react";
import { Medium, MediumOutline } from "../styles/font";
import { useNavigate } from "react-router-dom";
import { useRef, createContext, useEffect } from "react";
import { LanguageContext } from "../utils/LanguageProvider";
import HTTP from "../utils/HTTP";
import { getUserName, setUserName } from "../utils/User";
import { Language } from "../db/Language";
import { BASE_WEBSOCKET_URL } from "../Config";
import { WebsocketContext } from "../utils/WebSocketProvider";
import { useMediaQuery } from "react-responsive";
function RuleBox() {
  const mode = useContext(LanguageContext);
  return (
    <BgBox width="250px" height="300px" color="white">
      <Col>
        <Row>
          {" "}
          <MediumOutline size="30px" color="var(--purple)">
            {Language[mode].rule}
          </MediumOutline>
        </Row>
        <SizedBox height={"50px"} />
        <Medium size="23px" color="var(--purple)">
          {Language[mode].explanation}
        </Medium>
      </Col>
    </BgBox>
  );
}

function LoginBox() {
  const [name, setName] = useState(getUserName());

  var navigate = useNavigate();
  const mode = useContext(LanguageContext);
  const [createWebSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 사용

  const _joinGame = () => {
    if (name === "") {
      alert("fill in the blank");
      return;
    }
    if (name.length > 32) {
      alert("Name can be no more than 32 letters");
      return;
    }

    createWebSocketConnection(name); // Socket Connection 생성
  };
  return (
    <BgBox width="250px" height="300px" color="white">
      <Col>
        <Row>
          <MediumOutline size="30px" color="var(--purple)">
            {Language[mode].entrance}
          </MediumOutline>
        </Row>
        <SizedBox height={"20px"} />

        <SizedBox height={"40px"} />
        <Row>
          {" "}
          <Medium size="25px" color="var(--purple)">
            {Language[mode].name}
          </Medium>
          <input
            type={"text"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              borderRadius: "5px",
              width: "130px",
              marginLeft: "10px",
              height: "30px",
              borderColor: "var(--border)",
            }}
          />
        </Row>
        <SizedBox height={"50px"} />
        <Button
          width="100px"
          height="40px"
          text={Language[mode].join}
          onClick={_joinGame}
        />
      </Col>
    </BgBox>
  );
}

export default function LandingPage() {
  const mode = useContext(LanguageContext);
  const isMobile = useMediaQuery({ query: "(max-width:768px)" });

  return (
    <Container>
      <SizedBox height={"50px"} />

      <Anim2 delay={5}>
        <Logo />
      </Anim2>

      <RPSBox delay={5}>
        <Anim delay={1}>
          <SvgIcon src={ScissorSrc} size="100px" />
        </Anim>

        <Anim delay={2}>
          <SvgIcon src={RockSrc} size="100px" />
        </Anim>
        <Anim delay={3}>
          <SvgIcon src={PaperSrc} size="100px" />
        </Anim>
      </RPSBox>

      <SizedBox height={"10px"} />
      <Row>
        {!isMobile && (
          <>
            <RuleBox />

            <SizedBox width={"150px"} />
          </>
        )}

        <LoginBox />
      </Row>
    </Container>
  );
}

/*
https://apes0113.postype.com/post/2620
linear | ease | ease-in | ease-out | ease-in-out | step-start | step-end | steps(int,start|end) | cubic-bezier(n,n,n,n)
*/

const Responsive = styled.div`
  @media (max-width: 767px) {
    //모바일
    display: none;
  }
`;
const Anim = styled.div`
  animation: anim1 5s infinite ease-in-out;
  animation-delay: ${({ delay }) => delay}s;
  @keyframes anim1 {
    0% {
      transform: translate(0);
    }
    8% {
      transform: translateY(-10px);
    }

    16% {
      transform: translate(0);
    }
    100% {
      transform: translate(0);
    }
  }
`;

const Anim2 = styled.div`
  animation: anim2 5s infinite ease-in-out;
  animation-delay: ${({ delay }) => delay}s;
  @keyframes anim2 {
    0% {
      transform: scale(1);
    }

    80% {
      transform: scale(1);
    }
    90% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;
  padding-bottom: 50px;

  align-items: center;

  @media (max-width: 767px) {
    //모바일
    justify-content: space-between;
  }
  @media (min-width: 1200px) {
    // 데스크탑 일반
    height: 100vh;
    justify-content: center;
  }
`;

const Row = styled.div`
  display: flex;

  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;
const RPSBox = styled.div`
  display: flex;
  width: 30%;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;

  animation: anim2 5s infinite ease-in-out;
  animation-delay: ${({ delay }) => delay}s;
  @keyframes anim2 {
    0% {
      transform: scale(1);
    }

    80% {
      transform: scale(1);
    }
    90% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 30px;
`;
