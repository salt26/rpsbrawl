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
import { Medium } from "../styles/font";
import { useNavigate } from "react-router-dom";
import HTTP from "../utils/HTTP";

import { BASE_WEBSOCKET_URL } from "../Config";
function RuleBox() {
  return (
    <BgBox width="250px" height="300px" color="white">
      <Col>
        <Row>
          {" "}
          <Medium>규칙</Medium>
        </Row>
        <SizedBox height={"20px"} />
        <Medium size="25px">
          가장 마지막에 낸 사람의 손이 화면에 크게 보입니다. 이 손을 이기면
          +1점! 지면 -1점! 60초 안에 가장 많은 점수를 획득하세요!
        </Medium>
      </Col>
    </BgBox>
  );
}

function LoginBox() {
  const [name, setName] = useState("");
  const [selectedOption, setSelectedOption] = useState(""); //소속
  var navigate = useNavigate();

  const _joinGame = () => {
    if (selectedOption === "" || name === "") {
      alert("소속과 이름을 모두 채워주세요.");
      return;
    }

    try {
      // 웹소켓 연결

      let ws = new WebSocket(
        `${BASE_WEBSOCKET_URL}/join?affiliation=${selectedOption}&name=${name}`
      );

      ws.onopen = (event) => {
        console.log("Socket open", event);

        // ws.send("Successfully connected to socket"); // 여기에서 오류 발생
        ws.send(JSON.stringify({request: 'quit'}))      // 이것은 퇴장 요청, 적절히 수정 바람
      };
      ws.onerror = (err) => {
        console.log("err occured", err);
      };
      ws.onclose = (event) => {
        console.log("onclose!", event);
      };
      ws.onmessage = function (event) {
        const data = JSON.parse(event.data); // 전달된 json string을 object로 변환

        console.log("message from the server", data); //응답 정보 출력
      };
    } catch (e) {
      console.log(e);
      console.log("failed to connect socket");
    }
  };
  return (
    <BgBox width="250px" height="300px" color="white">
      <Col>
        <Row>
          {" "}
          <Medium>입장</Medium>
        </Row>
        <SizedBox height={"20px"} />
        <Row>
          <Medium size="30px">소속</Medium>
          <SelectBox
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
          />
        </Row>

        <SizedBox height={"20px"} />
        <Row>
          {" "}
          <Medium size="30px">이름</Medium>
          <input
            type={"text"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              borderRadius: "5px",
              width: "150px",
              marginLeft: "10px",
              height: "30px",
              borderColor: "var(--border)",
            }}
          />
        </Row>
        <SizedBox height={"50px"} />
        <Button width="100px" height="40px" text="입장" onClick={_joinGame} />
      </Col>
    </BgBox>
  );
}

export default function LandingPage() {
  return (
    <Container>
      <Logo />
      <Row>
        <SvgIcon src={ScissorSrc} size="200px" />
        <SvgIcon src={RockSrc} size="200px" />
        <SvgIcon src={PaperSrc} size="200px" />
      </Row>
      <SizedBox height={"50px"} />
      <Row>
        <RuleBox />
        <SizedBox width={"150px"} />

        <LoginBox />
      </Row>
    </Container>
  );
}

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

const Col = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;

  padding: 20px;
`;
