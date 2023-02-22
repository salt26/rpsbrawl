import React, { useContext } from "react";
import TrophySrc from "../../assets/images/1st_trophy.svg";
import { Medium, GradientText } from "../../styles/font";
import styled from "styled-components";
import BgBox from "../common/BgBox";
import SvgIcon from "../common/SvgIcon";
import SizedBox from "../common/SizedBox";
import { Language } from "../../db/Language";
import { LanguageContext } from "../../utils/LanguageProvider";
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
  const getNameSize = (name) => {
    console.log(name);
    if (name.length <= 5) {
      return "35px";
    } else if (name.length <= 10) {
      return "20px";
    } else if (name.length <= 20) {
      return "15px";
    } else {
      return "8px";
    }
  };
  const mode = useContext(LanguageContext);
  return (
    <div>
      <Medium size={"30px"} color={"white"}>
        {Language[mode].places}
      </Medium>
      <SizedBox height={"10px"} />
      <BgBox width={"350px"} height={"100px"}>
        <div style={{ padding: "10px", width: "100%" }}>
          <Row>
            <SvgIcon src={TrophySrc} size={"80px"} />
            <Col>
              <Medium size="27px">{team_color[team]}</Medium>

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
