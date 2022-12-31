import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Medium } from "../styles/font";
import styled from "styled-components";
import BgBox from "../components/common/BgBox";
import Button from "../components/common/Button";
import SizedBox from "../components/common/SizedBox";
import UserList from "../components/gameroom/UserList";
import { useNavigate } from "react-router-dom";
import HTTP from "../utils/HTTP";
import { useParams } from "react-router-dom";
import useInterval from "../utils/useInterval";
import { useLocation } from "react-router";
import {
  getUserName,
  getUserId,
  getUserAffiliation,
  flush,
} from "../utils/User";
import { WebsocketContext } from "../utils/WebSocketProvider";
import { useContext } from "react";

export default function WatingGamePage() {
  const { room_id } = useParams();
  const { state } = useLocation(); // 유저 목록 정보

  const [numberOfUser, setNumberOfUser] = useState(state.length);
  const [users, setUsers] = useState(state);
  const [start, setStart] = useState(false); //방장이 게임시작했는지 여부
  const isAuthorized = getUserAffiliation() === "STAFF";

  const person_id = getUserId();
  const person_name = getUserName();
  var navigate = useNavigate();

  const [createSocketConnection, ready, res, send] =
    useContext(WebsocketContext); //전역 소켓 불러오기

  useEffect(() => {
    /*유저목록 갱신하기*/
    if (ready) {
      //send("message from client");
      switch (res.type) {
        case "game_list":
          if (res.request === "join") {
            setUsers(res.data);
          } else if (res.request === "disconnected") {
            setUsers(res.data);
          }
          break;
        case "room": //게임 시작 요청
          setStart(true);

          break;
        case "hand_list": //해당 방의 손 목록 정보
          navigate(`/room/${room_id}/game`, { state: res.data });
      }
    }
  }, [ready, send, res]); // 메시지가 도착하면

  const _quitGame = () => {
    if (ready) {
      let request = {
        request: "quit",
      };
      send(request);
      navigate("/");
    }
  };

  const _startGame = () => {
    if (ready) {
      let request = {
        request: "start",
        time_offset: 5, // seconds, 플레이 중인 방으로 전환 후 처음 손을 입력받기까지 기다리는 시간
        time_duration: 60, // seconds, 처음 손을 입력받기 시작한 후 손을 입력받는 시간대의 길이
      };
      send(request);
      navigate(`/room/${room_id}/game`);
    }
  };
  return (
    <Container>
      <Medium color="white" size={"60px"}>
        무엇을 낼지 고민하는 중..
      </Medium>
      <Medium color="white" size={"30px"}>
        난투가 곧 시작됩니다! (현재 {numberOfUser}명)
      </Medium>
      <Row>
        <Sector>
          <Button text="나가기" onClick={_quitGame} />
        </Sector>
        <SizedBox width={"50px"} />
        <Sector>
          <BgBox bgColor={"var(--light-purple)"} width="1000px" height="500px">
            <UserList users={users} />
          </BgBox>
        </Sector>
        <SizedBox width={"50px"} />
        <Sector>
          {isAuthorized ? (
            <Button text="시작" onClick={_startGame} bgColor="var(--red)" />
          ) : (
            <></>
          )}
        </Sector>
      </Row>
    </Container>
  );
}
const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 30px;
  justify-content: space-around;
  align-items: center;
`;

const Row = styled.div`
  display: flex;

  width: 100%;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
`;
const Sector = styled.div`
  flex: 0.3;
  display: flex;
  justify-content: center;
  align-items: center;
`;
