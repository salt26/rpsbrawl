import React, { useEffect, useState } from "react";
import ResultBoard from "../components/gameroom/ResultBoard";
import Button from "../components/common/Button";
import styled from "styled-components";

import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserId } from "../utils/User";
import { CSVLink, CSVDownload } from "react-csv";
import { useContext } from "react";
import { WebsocketContext } from "../utils/WebSocketProvider";
import { Language } from "../db/Language";
import { LanguageContext } from "../utils/LanguageProvider";
import { Medium } from "../styles/font";
import { useMediaQuery } from "react-responsive";
import SizedBox from "../components/common/SizedBox";
import { RESULT_TIME } from "../Constants";
import useInterval from "../utils/useInterval";

export default function MobileGameResultScreen() {
  const mode = useContext(LanguageContext);
  const { room_id } = useParams();
  const { state } = useLocation(); // 손 목록 정보, 게임 전적 정보
  const person_id = getUserId();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: "(max-width:768px)" });
  const [createSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 불러오기

  const [count, setCount] = useState(20); // 게임 종료까지 남은 시간
  const _getTimeOffset = (room) => {
    const current = new Date();
    var end = new Date(room["end_time"].slice(0, 19).replace(" ", "T"));
    end.setSeconds(end.getSeconds() + RESULT_TIME); // 종료되는 시간
    var left = parseInt((end.getTime() - current.getTime()) / 1000);

    if (left >= 0) {
      setCount(left);
    }
  };

  useInterval(() => {
    _getTimeOffset(state.room);
  }, 500);

  useEffect(() => {
    ws.onmessage = function (event) {
      const res = JSON.parse(event.data);

      if (ready) {
        if (res?.response === "error") {
          alert(res.message);
          return;
        }

        switch (res?.type) {
          case "join_data": // 게임 시작 후 10초 지나면 다시 대기방으로
            navigate(`/rooms/${room_id}/waiting`, { state: res.data });
            break;

          case "room_list": // 방 퇴장 후 룸 목록 갱신 요청에 대한 응답
            navigate("/rooms", { state: res.data });
            break;
        }
      }
    };
  }, [ready]);
  return (
    <Box>
      <Medium color="white" size={isMobile ? "25px" : "30px"}>
        {Language[mode].result_page_text(count)}
      </Medium>
      {isMobile && <SizedBox height={"50px"} />}
      <ResultBoard result={state?.game_list} />;
      <Col>
        <CSVLink data={state?.game_list} filename="rps_brawl_game_result.csv">
          <Button text={Language[mode].save_result} />
        </CSVLink>
      </Col>
    </Box>
  );
}

const Box = styled.div`
  display: flex;

  width: 100%;
  height: 100%;

  //모바일
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;
const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
