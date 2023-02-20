import React from "react";
import TrophySrc from "../../assets/images/1st_trophy.svg";
import { Medium } from "../../styles/font";
import styled from "styled-components";
import BgBox from "../common/BgBox";
import SvgIcon from "../common/SvgIcon";
import SizedBox from "../common/SizedBox";

//1등 점수 정보
export default function FirstPlace({ place }) {
  const { team, score, name } = place;
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
    <div>
      <Medium size={"30px"} color={"white"}>
        Places
      </Medium>
      <SizedBox height={"10px"} />
      <BgBox width={"350px"} height={"100px"}>
        <Row>
          <SvgIcon src={TrophySrc} size={"80px"} />
          <Col>
            <Medium size="27px">{team_color[team]}</Medium>

            <Medium size="35px">{name}</Medium>
          </Col>
          <Medium size="40px">{score >= 0 ? "+" + score : score}</Medium>
        </Row>
      </BgBox>
    </div>
  );
}
const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
`;
