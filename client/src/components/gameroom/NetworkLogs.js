import React from "react";
import TrophySrc from "../../assets/images/1st_trophy.svg";
import { Medium } from "../../styles/font";
import styled from "styled-components";
import BgBox from "../common/BgBox";
import { Rock, Paper, Scissor } from "./RPS.js";
import SizedBox from "../common/SizedBox";
//1등 점수 정보
export default function NetworkLogs({ logs }) {
  const belong = "소속";
  const name = "내이름";
  const score = 7;
  return (
    <div>
      <Medium size={"40px"} color={"white"}>
        NetworkLogs
      </Medium>
      <SizedBox height={"10px"} />
      <BgBox width={"350px"} height={"300px"}>
        <Col>
          {/*네트워크 로그*/}
          <Log belong="King" name="김서연" rps="rock" score={100} />
          <Log belong="King" name="김서연" rps="rock" score={100} />
        </Col>
      </BgBox>
    </div>
  );
}

function Log({ belong, name, rps }) {
  var rps = <Rock size="50px" />;

  return (
    <Row>
      <Medium size={"30px"}>{belong}</Medium>
      <Medium size={"30px"}>{name}</Medium>
      {rps}

      <Medium color="var(--mint)" size={"30px"}>
        +1
      </Medium>
    </Row>
  );
}

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 20px;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;
