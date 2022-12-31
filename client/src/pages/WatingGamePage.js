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
  const { state } = useLocation();

  const [numberOfUser, setNumberOfUser] = useState(state.length);
  const [users, setUsers] = useState(state);
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

  const _startGame = () => {};
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
