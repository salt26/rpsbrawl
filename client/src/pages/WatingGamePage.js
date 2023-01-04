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
import { useRef } from "react";

export default function WatingGamePage() {
  const { room_id } = useParams();
  const { state } = useLocation(); // 유저 목록 정보

  const [numberOfUser, setNumberOfUser] = useState(state.length);
  const [users, setUsers] = useState(state);
  const [room, setRoom] = useState(null); //Room정보
  const [handList, setHandList] = useState(null);
  const [gameList, setGameList] = useState(null);

  // ! 관리자 여부 -> bool이 아니라 string임에 유의(js는 "false" 를 true로 판단)!
  const isAuthorized = localStorage.getItem("is_admin");

  const person_id = getUserId();
  const person_name = getUserName();
  var navigate = useNavigate();

  const [createSocketConnection, ready, res, send] =
    useContext(WebsocketContext); //전역 소켓 불러오기

  useEffect(() => {
    if (ready) {
      console.log(res.type, res.data);

      if (res?.response == "error") {
        alert(res.message);
        return;
      }

      switch (res.request) {
        case "join":
        case "disconnected":
        case "quit":
          setUsers(res.data);
          setNumberOfUser(res.data.length);
          break;
        case "start":
          // 게임이 시작하면 room -> hand -> game 순으로 전달
          if (res.type === "init_data") {
            navigate(`/room/${room_id}/game`, {
              state: res.data,
            });
          }

          break;
      }
    }
  }, [ready, send, res]); // 메시지가 바뀔때마다

  const _quitGame = () => {
    if (ready) {
      let request = {
        request: "quit",
      };

      send(JSON.stringify(request));
      navigate("/");
      localStorage.removeItem("is_admin");
    }
  };

  const _startGame = () => {
    console.log(ready);
    if (ready) {
      let request = {
        request: "start",
        time_offset: 5, // seconds, 플레이 중인 방으로 전환 후 처음 손을 입력받기까지 기다리는 시간
        time_duration: 60, // seconds, 처음 손을 입력받기 시작한 후 손을 입력받는 시간대의 길이
      };

      send(JSON.stringify(request));

      //navigate(`/room/${room_id}/game`);
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
          {isAuthorized === "true" ? (
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
