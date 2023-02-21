import React from "react";
import TrophySrc from "../../assets/images/1st_trophy.svg";
import { Medium, GradientText } from "../../styles/font";
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
  const getNameSize = (name) => {
    console.log(name);
    if (name.length <= 5) {
      return "40px";
    } else if (name.length <= 10) {
      return "25px";
    } else if (name.length <= 20) {
      return "20px";
    } else {
      return "10px";
    }
  };

  return (
    <BgBox width={"350px"} height={"130px"}>
      <div style={{ padding: "10px", width: "100%" }}>
        <Row>
          <Rank rank={rank} />
          <Col>
            <Medium size="30px">{team_color[team]}</Medium>

            <Medium size={getNameSize(name)}>{name}</Medium>
          </Col>

          {score >= 0 ? (
            <GradientText
              bg={
                "linear-gradient(180deg, #3AB6BC 0%, #3A66BC 100%, #2F508E 100%);"
              }
            >
              +{score}
            </GradientText>
          ) : (
            <GradientText
              bg={"linear-gradient(180deg, #FA1515 0%, #F97916 100%);"}
            >
              {score}
            </GradientText>
          )}
        </Row>
      </div>
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
