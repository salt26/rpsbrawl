import React from "react";
import TrophySrc from "../../assets/images/1st_trophy.svg";
import { Medium } from "../../styles/font";
import styled from "styled-components";
import BgBox from "../common/BgBox";
import SvgIcon from "../common/SvgIcon";

//1등 점수 정보
export default function FirstPlace({ place }) {
  const { affiliation, score, name } = place;

  return (
    <BgBox width={"350px"} height={"100px"}>
      <Row>
        <SvgIcon src={TrophySrc} size={"80px"} />
        <Col>
          <Medium size="35px">{affiliation}</Medium>

          <Medium size="25px">{name}</Medium>
        </Col>
        <Medium size="40px">{score >= 0 ? "+" + score : score}</Medium>
      </Row>
    </BgBox>
  );
}
const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  height: 100%;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
`;
