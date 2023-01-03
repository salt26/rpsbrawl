import React, { useState, useEffect } from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import styled from "styled-components";
import Clock from "./Clock";
import SizedBox from "../common/SizedBox";
import ClockSrc from "../../assets/images/clock.png";
import SvgIcon from "../common/SvgIcon";
import useInterval from "../../utils/useInterval";
import { Medium } from "../../styles/font";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { WebsocketContext } from "../../utils/WebSocketProvider";

export default function TimeBar({ duration }) {
  const [sec, setSec] = useState(60);
  const [isRunning, setIsRunning] = useState(false);

  //console.log(sec, isWaiting, isRunning);
  const [createSocketConnection, ready, res, send] =
    useContext(WebsocketContext); //전역 소켓 불러오기

  var navigate = useNavigate();

  const { room_id } = useParams();

  useInterval(
    () => {
      setSec(sec - 1);
      //console.log(sec);
      if (sec === 1) {
        setIsRunning(false);
        //navigate(`/room/${room_id}/result`); // 결과창으로 이동
      }
    },
    isRunning ? 1000 : null
  );

  const _getLeftTime = (targetISOString) => {
    // start_time이랑 비교해서 남은시간제한 구하기.
    // 형식 => 2023-01-03 00:35:41.029853 KST
    const current = new Date();
    var start = new Date(targetISOString.slice(0, 19));
    var offset = Math.floor((current.getTime() - start.getTime()) / 1000);
    const left = 60 - parseInt(offset / 1000);

    if (left <= 0) {
      // 시간이 지나치게 경과한 경우..
      navigate(`/room/${room_id}/result`); // 바로 결과창으로 이동
    } else {
      setSec(duration - parseInt(offset / 1000)); //타이머 초깃값 세팅
      setIsRunning(true);
    }
  };

  useEffect(() => {
    if (ready) {
      switch (res.request) {
        case "start":
          if (res.type === "room_start") {
            console.log(res.data["start_time"]);
            _getLeftTime(res.data["start_time"]);
          }

          break;
      }
    }
  }, [ready, send, res]); // 메시지가 도착하면
  return (
    <Row>
      <SvgIcon src={ClockSrc} size="100px" />
      <SizedBox width={"50px"} />
      <ProgressBar
        completed={String((sec * 100) / 60)}
        customLabel=" "
        bgColor={sec < 20 ? "var(--red)" : "var(--yellow)"}
        width="500px"
        height="40px"
      />
      <SizedBox width={"10px"} />
      <Medium color="white" size={"25px"}>
        {sec}
      </Medium>
    </Row>
  );
}
const Row = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;
