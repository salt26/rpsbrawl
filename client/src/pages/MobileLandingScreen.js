/*계정 접속, 로그인*/

import React, { useState } from "react";
import styled from "styled-components";
import Logo from "../components/common/Logo";
import RockSrc from "../assets/images/rock.png";
import ScissorSrc from "../assets/images/scissor.png";
import PaperSrc from "../assets/images/paper.png";
import SvgIcon from "../components/common/SvgIcon";
import SizedBox from "../components/common/SizedBox";
import Github from "../components/Github";
import Button from "../components/common/Button";
import { useContext } from "react";
import { Medium, MediumOutline } from "../styles/font";
import { useNavigate } from "react-router-dom";
import { useRef, createContext, useEffect } from "react";
import { LanguageContext } from "../utils/LanguageProvider";

import { getUserName, setUserName } from "../utils/User";
import { Language } from "../db/Language";

import { WebsocketContext } from "../utils/WebSocketProvider";
import { useMediaQuery } from "react-responsive";
import axios from "axios";
import qs from "qs";

function Tabs({ currentTab, setCurrentTab }) {
  const mode = useContext(LanguageContext);
  return (
    <RowBetween>
      {currentTab == 0 ? (
        <SelectedTab>
          <MediumOutline size="var(--font-size-lg)" color="var(--purple)">
            {Language[mode].rule}
          </MediumOutline>
        </SelectedTab>
      ) : (
        <Tab onClick={() => setCurrentTab(0)}>
          <MediumOutline size="var(--font-size-lg)" color="gray">
            {Language[mode].rule}
          </MediumOutline>
        </Tab>
      )}
      {currentTab == 1 ? (
        <SelectedTab>
          <MediumOutline size="var(--font-size-lg)" color="var(--purple)">
            {Language[mode].start}
          </MediumOutline>
        </SelectedTab>
      ) : (
        <Tab onClick={() => setCurrentTab(1)}>
          <MediumOutline size="var(--font-size-lg)" color="gray">
            {Language[mode].start}
          </MediumOutline>
        </Tab>
      )}
    </RowBetween>
  );
}

const RowBetween = styled.div`
  display: flex;
  width: 80%;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

const Tab = styled.div`
  // 미클릭
  background-color: #ececec;
  border-radius: 10px;
  width: 48%;
  height: 5vh;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
`;

const SelectedTab = styled.div`
  //선택
  background-color: white;
  border-radius: 10px;
  width: 48%;
  height: 5vh;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
`;

function RuleBox() {
  const mode = useContext(LanguageContext);
  return (
    <BgBox width="80%" height="30vh" color="white">
      <Center>
        <SizedBox height={"50px"} />
        <Medium size="var(--font-size-ml)" color="var(--purple)">
          {Language[mode].explanation}
        </Medium>
      </Center>
    </BgBox>
  );
}

function LoginBox() {
  const [name, setName] = useState(getUserName());

  var navigate = useNavigate();
  const mode = useContext(LanguageContext);
  const [createWebSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 사용
  const [isLoading, setIsLoading] = useState(false); // 버튼 클릭 후 처리 중인지

  const _joinGame = async () => {
    if (name === "") {
      alert(Language[mode].name_blank);
      return;
    }
    if (name.length > 32) {
      alert(Language[mode].name_long);
      return;
    }
    if (!isLoading) {
      setIsLoading(true);
      console.log("요청!");
      var body = {
        grant_type: "",
        username: process.env.REACT_APP_RPS_USERNAME,
        password: process.env.REACT_APP_RPS_PASSWORD,
        scope: "",
        client_id: "",
        client_secret: "",
      };

      try {
        /*비동기 요청*/
        const response = await axios.post(
          `${process.env.REACT_APP_RPS_BASE_SERVER_URL}/token`,
          qs.stringify(body),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
            },
          }
        );

        localStorage.setItem("access_token", response.data.access_token);

        await createWebSocketConnection(name, setIsLoading); // Socket Connection 생성
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  return (
    <BgBox width="80%" height="30vh" color="white">
      <Col>
        <SizedBox height={"60px"} />

        <Row>
          {" "}
          <Medium size={`var(--font-size-ml)`} color="var(--purple)">
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

export default function MobileLandingScreen() {
  const mode = useContext(LanguageContext);
  const [currentTab, setCurrentTab] = useState(1);
  return (
    <Container>
      <SizedBox height={"50px"} />

      <Anim2 delay={5}>
        <Logo size="m" />
      </Anim2>

      <RPSBox delay={5}>
        <Anim delay={1}>
          <SvgIcon src={ScissorSrc} size="100%" />
        </Anim>

        <Anim delay={2}>
          <SvgIcon src={RockSrc} size="100%" />
        </Anim>
        <Anim delay={3}>
          <SvgIcon src={PaperSrc} size="100%" />
        </Anim>
      </RPSBox>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
        }}
      >
        <Tabs currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {currentTab === 0 ? <RuleBox /> : <LoginBox />}
      </div>
      <GithubBox>
        <Github />
      </GithubBox>
    </Container>
  );
}

/*
https://apes0113.postype.com/post/2620
linear | ease | ease-in | ease-out | ease-in-out | step-start | step-end | steps(int,start|end) | cubic-bezier(n,n,n,n)
*/
const GithubBox = styled.div`
  position: absolute;
  right: 4%;
  top: 3%;
  width: 40px;
  height: 40px;
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

  display: flex;
  flex-direction: column;
  align-items: center;

  justify-content: center;

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

  justify-content: space-between;
`;

const Row = styled.div`
  display: flex;

  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;

const Center = styled.div`
  display: flex;

  justify-content: center;
  align-items: center;
  padding: 50px;
`;
const RPSBox = styled.div`
  display: flex;
  width: 80vw;
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

const BgBox = styled.div`
  width: ${({ width }) => (width ? width : "100%")};
  height: ${({ height }) => (height ? height : "auto")};
  background-color: ${({ bgColor }) => (bgColor ? bgColor : "white")};
  border-radius: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;
