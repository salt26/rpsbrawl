import React from "react";
import styled from "styled-components";
import FirstPlace from "../components/gameroom/FirstPlace";
import MyPlace from "../components/gameroom/MyPlace";
import NetworkLogs from "../components/gameroom/NetworkLogs";
import TimeBar from "../components/gameroom/TimeBar";
import RPSSelection from "../components/gameroom/RPSSelection";
import { useLocation } from "react-router-dom";
import { WebsocketContext } from "../utils/WebSocketProvider";
import { useContext, useEffect } from "react";

export default function InGamePage() {
  const { state } = useLocation(); // 손 목록 정보, 게임 전적 정보

  console.log(state);

  return (
    <Container>
      <Left>
        <TimeBar />
        <RPSSelection />
      </Left>

      <Right>
        <FirstPlace />
        <MyPlace />
        <NetworkLogs hand_list={state.handList} />
      </Right>
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const Left = styled.div`
  flex: 0.6;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 30px;
  justify-content: space-around;
  align-items: center;
`;
const Right = styled.div`
  display: flex;
  flex: 0.4;
  height: 100vh;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
`;
