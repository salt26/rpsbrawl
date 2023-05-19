import React, { useState, useEffect, useCallback } from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import styled from "styled-components";

import SizedBox from "../common/SizedBox";
import ClockSrc from "../../assets/images/clock.png";
import SvgIcon from "../common/SvgIcon";
import useInterval from "../../utils/useInterval";
import { Medium } from "../../styles/font";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { WebsocketContext } from "../../utils/WebSocketProvider";
import { useMediaQuery } from "react-responsive";

export default function TimeBar({ roomInfo }) {
  const { time_duration, start_time } = roomInfo;
  const [sec, setSec] = useState(time_duration);
  const [isRunning, setIsRunning] = useState(false);

  const isMobile = useMediaQuery({ query: "(max-width:768px)" });

  const [createSocketConnection, ready, res, send] =
    useContext(WebsocketContext); //전역 소켓 불러오기

  var navigate = useNavigate();

  const { room_id } = useParams();

  useEffect(() => {
    if (start_time) {
      _getLeftTime(start_time);
      setIsRunning(true);
    }
  }, [roomInfo]);

  useInterval(
    () => {
      setSec(sec - 1);
      if (sec === 1) {
        setIsRunning(false);
      }
    },
    isRunning ? 1000 : null
  );

  const _getLeftTime = (targetISOString) => {
    // start_time이랑 비교해서 남은시간제한 구하기.
    // 형식 => 2023-01-03 00:35:41.029853 KST
    const current = new Date();
    var end = new Date(targetISOString.slice(0, 19).replace(" ", "T"));
    end.setSeconds(end.getSeconds() + roomInfo["time_duration"]);
    var left = Math.floor((end.getTime() - current.getTime()) / 1000);

    if (left <= 0) {
      // 시간이 지나치게 경과한 경우..

      navigate(`/rooms`, { state: [] }); // 룸 목록으로 이동
    } else {
      setSec(left); //타이머 초깃값 세팅
      setIsRunning(true);
    }
  };

  return (
    <Row>
      <SvgIcon src={ClockSrc} size={isMobile ? `30vw` : "50px"} />
      <SizedBox width={"6vw"} />
      <ProgressBar
        completed={String((sec * 100) / time_duration)}
        customLabel=" "
        bgColor={sec / time_duration <= 0.2 ? "var(--red)" : "#BDFF00"}
        width={isMobile ? `70vw` : "550px"}
        height="5vh"
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
