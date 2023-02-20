import React, { useEffect } from "react";
import ResultBoard from "../components/gameroom/ResultBoard";
import Button from "../components/common/Button";
import styled from "styled-components";
import HTTP from "../utils/HTTP";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserId } from "../utils/User";
import { CSVLink, CSVDownload } from "react-csv";
import { useContext } from "react";
import { WebsocketContext } from "../utils/WebSocketProvider";

export default function GameResultPage() {
  const { room_id } = useParams();
  const { state } = useLocation(); // 손 목록 정보, 게임 전적 정보
  const person_id = getUserId();
  const navigate = useNavigate();

  const [createSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 불러오기
  const _quitGame = () => {
    let request1 = {
      request: "quit",
    };
    let request2 = {
      request: "refresh",
    };
    ws.send(JSON.stringify(request1));
    ws.send(JSON.stringify(request2));
  };

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
    <Row>
      {/**<Button text="나가기" onClick={_quitGame} /> */}
      <ResultBoard result={state?.game_list} />;
      <Col>
        <CSVLink data={state?.game_list} filename="rps_brawl_game_result.csv">
          <Button text="결과저장" />
        </CSVLink>
      </Col>
    </Row>
  );
}
const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-end;
  padding-bottom: 50px;
  height: 100%;
`;
const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-left: -20%;
`;
