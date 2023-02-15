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
import {
  setUserName,
  getUserName,
  getUserAffiliation,
  setUserId,
  setUserAffiliation,
} from "../utils/User";
import { Language } from "../db/Language";
import { BASE_WEBSOCKET_URL } from "../Config";
import { WebsocketContext } from "../utils/WebSocketProvider";

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
  const [selectedOption, setSelectedOption] = useState(getUserAffiliation()); //소속
  const [roomId, setRoomId] = useState();
  var navigate = useNavigate();
  const mode = useContext(LanguageContext);
  const [createWebSocketConnection, ready, res, send] =
    useContext(WebsocketContext); //전역 소켓 사용

  useEffect(() => {
    if (ready) {
      if (res?.response === "error") {
        alert(res.message);
        return;
      }

      switch (res?.type) {
        case "profile":
          // 사용자 정보(이름,소속,저장,관리자 여부)를 로컬스토리지에 저장
          const { data } = res;
          console.log(data);
          setUserName(data.name);
          setUserAffiliation(data.affiliation);
          setUserId(data.person_id);
          setRoomId(data.room_id); // 할당된 룸 번호 저장
          localStorage.setItem("is_admin", data.is_admin); // 관리자 여부

          break;

        case "game_list": // 방목록으로 이동
          console.log(res.data);
          if (roomId) {
            navigate(`/rooms`, { state: res.data }); // 게임 대기화면 이동 + 해당 방 목록 인원 전달
          }
      }
    }
  }, [ready, send, res]); // 소켓연결에 성공했다면

  const _joinGame = () => {
    if (name === "") {
      alert("fill in the blank");
      return;
    }
    navigate("./rooms");
    //createWebSocketConnection(selectedOption, name); // Socket Connection 생성
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

  return (
    <Container>
      <SizedBox height={"20px"} />

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

      <SizedBox height={"20px"} />
      <Row>
        <RuleBox />
        <SizedBox width={"150px"} />

        <LoginBox />
      </Row>
    </Container>
  );
}

/*
https://apes0113.postype.com/post/2620
linear | ease | ease-in | ease-out | ease-in-out | step-start | step-end | steps(int,start|end) | cubic-bezier(n,n,n,n)
*/
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
  height: 100vh;
  display: flex;
  flex-direction: column;

  justify-content: flex-start;
  align-items: center;
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
