import React, { useState } from "react";
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

//1등 점수 정보
export default function NetworkLogs({ hand_list }) {
  var rpsDic = { 0: "rock", 1: "scissor", 2: "paper" };
  const [logs, setLogs] = useState(hand_list);
  const [createSocketConnection, ready, res, send] =
    useContext(WebsocketContext); //전역 소켓 불러오기

  useEffect(() => {
    console.log(res);
    /*손목록 갱신하기*/
    if (ready) {
      switch (res.type) {
        case "hand_list":
          setLogs(res.data);
      }
    }
  }, [ready, send, res]); // 메시지가 도착하면
  return (
    <div>
      <Medium size={"40px"} color={"white"}>
        NetworkLogs
      </Medium>
      <SizedBox height={"10px"} />
      <BgBox width={"350px"} height={"300px"}>
        <ScrollView>
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
  background-color: white;
  border-radius: 10px;
  overflow-x: hidden;
  overflow-y: auto;
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
