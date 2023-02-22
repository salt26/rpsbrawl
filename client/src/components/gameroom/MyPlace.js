import React from "react";
import TrophySrc from "../../assets/images/1st_trophy.svg";
import { Medium, GradientText } from "../../styles/font";
import styled from "styled-components";
import BgBox from "../common/BgBox";
import { useMediaQuery } from "react-responsive";

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
  const isMobile = useMediaQuery({ query: "(max-width:768px)" });
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
    <BgBox width={isMobile ? "45%" : "60%"} height={isMobile ? "80%" : "20%"}>
      <Row>
        <Rank rank={rank} isMobile={isMobile} />
        <Col>
          <Medium size={isMobile ? "27px" : "30px"}>{team_color[team]}</Medium>

          <Medium size={getNameSize(name)}>{name}</Medium>
        </Col>

        {score >= 0 ? (
          <GradientText
            bg={
              "linear-gradient(180deg, #3AB6BC 0%, #3A66BC 100%, #2F508E 100%);"
            }
            size={isMobile ? "30px" : "50px"}
          >
            +{score}
          </GradientText>
        ) : (
          <GradientText
            bg={"linear-gradient(180deg, #FA1515 0%, #F97916 100%);"}
            size={isMobile ? "30px" : "50px"}
          >
            {score}
          </GradientText>
        )}
      </Row>
    </BgBox>
  );
}
function Rank({ rank, isMobile }) {
  return (
    <Circle size={isMobile ? "30px" : "60px"}>
      <Medium color="white" size={isMobile ? "20px" : "60px"}>
        {rank}
      </Medium>
    </Circle>
  );
}

const Circle = styled.div`
  border-radius: 100%;
  width: ${({ size }) => (size ? size : "80px")};
  height: ${({ size }) => (size ? size : "80px")};
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
  padding: 5px;
`;

const Col = styled.div`
  display: flex;

  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;
