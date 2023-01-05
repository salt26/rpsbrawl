import React from "react";
import TrophySrc from "../../assets/images/1st_trophy.svg";
import { Medium } from "../../styles/font";
import styled from "styled-components";
import BgBox from "../common/BgBox";

//내 점수 정보
export default function MyPlace({ place }) {
  const { affiliation, score, name, rank } = place;

  return (
    <BgBox width={"350px"} height={"130px"}>
      <Row>
        <Rank rank={rank} />
        <Col>
          <Medium size="30px">{affiliation}</Medium>

          <Medium size="45px">{name}</Medium>
        </Col>
        <Medium>{score >= 0 ? "+" + score : score}</Medium>
      </Row>
    </BgBox>
  );
}
function Rank({ rank }) {
  return (
    <Circle>
      <Medium color="white" size={"60px"}>
        {rank}
      </Medium>
    </Circle>
  );
}

const Circle = styled.div`
  border-radius: 100%;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--mint);
`;
const Row = styled.div`
  display: flex;
  height: 100%;
  flex-direction: row;
  justify-content: space-evenly;

  align-items: center;
`;

const Col = styled.div`
  display: flex;
  flex: 0.5;

  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;
