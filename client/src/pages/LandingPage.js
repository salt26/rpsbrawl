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
    if (selectedOption == "" || name == "") {
      alert("소속과 이름을 모두 채워주세요.");
      return;
    }

    HTTP.post(`/room?affiliation=${selectedOption}&name=${name}`)
      .then((res) => {
        if (res.status == 200) {
          const { person_id, room_id } = res.data;
          sessionStorage.setItem("person_id", person_id);
          sessionStorage.setItem("person_name", name);
          sessionStorage.setItem("affiliation", selectedOption);
          navigate(`/room/${room_id}/waiting`);
        } else {
          alert("게임 입장에 실패하였습니다. 새로고침 후 다시시도해주세요.");
        }
      })
      .catch((err) => {
        console.log(err);

        alert(
          `해당 소속과 이름의 유저는 게임중입니다. 게임을 강제종료했다면 
          게임이 종료될때까지 기다린 후에 다시 시도해주세요.`
        );
      });
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
