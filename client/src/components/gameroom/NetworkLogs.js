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

//1등 점수 정보
export default function NetworkLogs({ logs }) {
  console.log(logs);
  var rpsDic = { 0: "rock", 1: "scissor", 2: "paper" };

  const scrollRef = useRef();
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

  return (
    <div>
      <Medium size={"40px"} color={"white"}>
        NetworkLogs
      </Medium>
      <SizedBox height={"10px"} />
      <BgBox width={"350px"} height={"300px"}>
        <ScrollView ref={scrollRef} id="log_container">
          {/*네트워크 로그*/}

          {logs &&
            logs.map(({ affiliation, name, hand, score }, idx) => (
              <Log
                belong={affiliation}
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

  return (
    <Row>
      <Medium size={"30px"}>{belong}</Medium>
      <Medium size={"30px"}>{name}</Medium>
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
