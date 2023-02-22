import React, { useState, useRef } from "react";
import TrophySrc from "../../assets/images/1st_trophy.svg";
import { Medium } from "../../styles/font";
import styled from "styled-components";
import BgBox from "../common/BgBox";
import { Rock, Paper, Scissor } from "./RPS.js";
import SizedBox from "../common/SizedBox";
import useInterval from "../../utils/useInterval";
import { useParams } from "react-router-dom";
import HTTP from "../../utils/HTTP";
import { WebsocketContext } from "../../utils/WebSocketProvider";
import { useContext, useEffect } from "react";
import "./networklog.css";
import { Language } from "../../db/Language";
import { LanguageContext } from "../../utils/LanguageProvider";

import { useMediaQuery } from "react-responsive";

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
    console.log(scrollRef.current);
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
    <div>
      <Medium size={"30px"} color={"white"}>
        {Language[mode].network_logs}
      </Medium>
      <SizedBox height={"10px"} />

      <BgBox width={"350px"} height={isMobile ? "150px" : "300px"}>
        <ScrollView ref={scrollRef} id="log_container">
          {/*네트워크 로그*/}

          {logs &&
            logs.map(({ team, name, hand, score }, idx) => (
              <Log
                belong={team === -1 ? "Bot" : team_color[team]}
                key={idx}
                name={name}
                rps={rpsDic[hand]}
                score={score}
              />
            ))}
        </ScrollView>
      </BgBox>
    </div>
  );
}

function Log({ belong, name, rps, score }) {
  var rpsDic = {
    rock: <Rock size="50px" />,
    scissor: <Scissor size="50px" />,
    paper: <Paper size="50px" />,
  };
  const getNameSize = (name) => {
    console.log(name);
    if (name.length <= 5) {
      return "30px";
    } else if (name.length <= 10) {
      return "25px";
    } else if (name.length <= 20) {
      return "20px";
    } else {
      return "10px";
    }
  };
  return (
    <Row>
      <Medium size={"30px"}>{belong}</Medium>
      <Medium size={getNameSize(name)}>{name}</Medium>
      {rpsDic[rps]}
      {score >= 0 ? (
        <Medium color="var(--mint)" size={"30px"}>
          +{score}
        </Medium>
      ) : (
        <Medium color="var(--red)" size={"30px"}>
          {score}
        </Medium>
      )}
    </Row>
  );
}
const ScrollView = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background-color: white;
  border-radius: 10px;
  overflow-x: hidden;
  overflow-y: scroll;
`;
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
