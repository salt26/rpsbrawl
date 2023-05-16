import React, { useState, useRef } from "react";
import TrophySrc from "../../assets/images/1st_trophy.svg";
import { GradientText, Medium } from "../../styles/font";
import styled from "styled-components";
import { Rock, Paper, Scissor } from "./RPS.js";
import SizedBox from "../common/SizedBox";
import useInterval from "../../utils/useInterval";
import { useParams } from "react-router-dom";

import { WebsocketContext } from "../../utils/WebSocketProvider";
import { useContext, useEffect } from "react";
import "./networklog.css";
import { Language } from "../../db/Language";
import { LanguageContext } from "../../utils/LanguageProvider";
import palette from "../../styles/palette";
import { useMediaQuery } from "react-responsive";
import { isMobile } from "react-device-detect";

//1등 점수 정보
export default function NetworkLogs({ logs }) {
  var rpsDic = { 0: "rock", 1: "scissor", 2: "paper" };
  const mode = useContext(LanguageContext);
  const scrollRef = useRef();
  const isMobile = useMediaQuery({ query: "(max-width:768px)" });
  useEffect(() => {
    // 스크롤 위치 하단 고정 -> 좀 부자연스러운 느낌?
    /*https://velog.io/@matajeu/React-div-%EC%8A%A4%ED%81%AC%EB%A1%A4-%EB%A7%A8-%EB%B0%91%EC%9C%BC%EB%A1%9C-%EB%82%B4%EB%A6%AC%EA%B8%B0-%EC%8A%A4%ED%81%AC%EB%A1%A4-%EC%9C%84%EC%B9%98-%EC%A1%B0%EC%9E%91%ED%95%98%EA%B8%B0*/
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  /*
  useEffect(() => {
    const $scroll = document.getElementById("scroll");

    $scroll.scrollTop = $scroll.scrollHeight;
  }, []);
*/
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
    <div
      style={{
        width: isMobile ? "90%" : "60%",
        height: isMobile ? "35vh" : "360px",

        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      <Medium size={"30px"} color={"white"}>
        {Language[mode].network_logs}
      </Medium>
      <SizedBox height={"10px"} />

      <ScrollView ref={scrollRef} id="log_container">
        {/*네트워크 로그*/}
        <table>
          {logs &&
            logs.map(({ team, name, hand, score }, idx) => (
              <Log
                belong={team === -1 ? "bot" : team_color[team]}
                key={idx}
                name={name}
                rps={rpsDic[hand]}
                score={score}
              />
            ))}
        </table>
      </ScrollView>
    </div>
  );
}

function Log({ belong, name, rps, score }) {
  var rpsDic = {
    rock: <Rock size={isMobile ? "10vw" : "40px"} />,
    scissor: <Scissor size={isMobile ? "10vw" : "40px"} />,
    paper: <Paper size={isMobile ? "10vw" : "40px"} />,
  };

  return (
    <Row>
      <Td width={"25%"}>
        <GradientText size="var(--font-size-md)" bg={palette[belong]}>
          {belong}
        </GradientText>
      </Td>
      <Td width={"35%"}>
        {/**/}
        <Medium size={"var(--font-size-ms)"}>{name}</Medium>
      </Td>
      <Td width={"10%"}>{rpsDic[rps]}</Td>
      <Td width={"10%"}>
        {score >= 0 ? (
          <Medium color="var(--mint)" size={"30px"}>
            +{score}
          </Medium>
        ) : (
          <Medium color="var(--red)" size={"30px"}>
            {score}
          </Medium>
        )}
      </Td>
    </Row>
  );
}
const Td = styled.td`
  width: ${({ width }) => (width ? width : "25%")};
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;
const ScrollView = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  background-color: white;
  border-radius: 10px;

  padding-left: 10px;

  overflow-x: hidden;
  overflow-y: scroll;
  flex-wrap: wrap;
`;
const Row = styled.tr`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
`;
