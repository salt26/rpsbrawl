import React from "react";
import TrophySrc from "../../assets/images/1st_trophy.svg";
import { Medium } from "../../styles/font";
import styled from "styled-components";
import BgBox from "../common/BgBox";

//내 점수 정보
export default function MyPlace({ place }) {
  const { team, score, name, rank } = place;
  const team_color = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "navy",
    "purple",
  ];

  return (
    <BgBox width={"350px"} height={"130px"}>
      <Row>
        <Rank rank={rank} />
        <Col>
          <Medium size="30px">{team_color[team]}</Medium>

          <Medium size="40px">{name}</Medium>
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
  background: linear-gradient(180deg, #3ab6bc 0%, #3a66bc 100%, #2f508e 100%);
`;
const Row = styled.div`
  display: flex;
  height: 100%;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
  align-items: center;
`;

const Col = styled.div`
  display: flex;

  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;
