import React, { useContext } from "react";
import TrophySrc from "../../assets/images/1st_trophy.svg";
import { Medium, GradientText } from "../../styles/font";
import styled from "styled-components";
import BgBox from "../common/BgBox";
import SvgIcon from "../common/SvgIcon";
import SizedBox from "../common/SizedBox";
import { Language } from "../../db/Language";
import { LanguageContext } from "../../utils/LanguageProvider";
import { useMediaQuery } from "react-responsive";
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

  const isMobile = useMediaQuery({ query: "(max-width:768px)" });
  const mode = useContext(LanguageContext);
  return (
    <BgBox
      width={isMobile ? "45%" : "60%"}
      height={isMobile ? "10vh" : "100px"}
    >
      <Row>
        <SvgIcon src={TrophySrc} size={isMobile ? "30px" : "60px"} />
        <Col>
          <Medium size={`var(--font-size-md)`}>{team_color[team]}</Medium>

          <Medium
            size={
              isMobile
                ? String(8 - name.length / 5) + "vw"
                : String(30 - 6 * (name.length / 7)) + "px"
            }
          >
            {name}
          </Medium>
        </Col>
        {score >= 0 ? (
          <GradientText
            bg={
              "linear-gradient(180deg, #3AB6BC 0%, #3A66BC 100%, #2F508E 100%);"
            }
            size={isMobile ? "var(--font-size-lg)" : "50px"}
          >
            +{score}
          </GradientText>
        ) : (
          <GradientText
            bg={"linear-gradient(180deg, #FA1515 0%, #F97916 100%);"}
            size={isMobile ? "var(--font-size-lg)" : "50px"}
          >
            {score}
          </GradientText>
        )}
      </Row>
    </BgBox>
  );
}
const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding: 5px;
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
