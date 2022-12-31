import React, { useState } from "react";
import styled from "styled-components";
import FirstPlace from "../components/gameroom/FirstPlace";
import MyPlace from "../components/gameroom/MyPlace";
import NetworkLogs from "../components/gameroom/NetworkLogs";
import TimeBar from "../components/gameroom/TimeBar";
import RPSSelection from "../components/gameroom/RPSSelection";
import { useLocation } from "react-router-dom";
import { WebsocketContext } from "../utils/WebSocketProvider";
import { useContext, useEffect } from "react";

import { getUserName, getUserAffiliation } from "../utils/User";

export default function InGamePage() {
  const { state } = useLocation(); // 손 목록 정보, 게임 전적 정보
  console.log(state);
  const my_name = getUserName();
  const my_affiliation = getUserAffiliation();

  const [myPlace, setMyPlace] = useState({
    name: my_name,
    affiliation: my_affiliation,
    rank: 0,
    score: 0,
  });

  const [createSocketConnection, ready, res, send] =
    useContext(WebsocketContext); //전역 소켓 불러오기

  useEffect(() => {
    /*전적목록 갱신하기*/
    if (ready) {
      switch (res.type) {
        case "game_list":
          setMyPlace(_findMyPlace(res.data));
      }
    }
  }, [ready, send, res]); // 메시지가 도착하면

  const _findMyPlace = (gameList) => {
    for (var user of gameList) {
      if (user.name == my_name && user.affiliation == my_affiliation) {
        // 소속, 이름이 같으면
        return user;
      }
    }

    return { name: "없음", affiliation: "찾을수d없음", rank: 0 };
  };
  return (
    <Container>
      <Left>
        <TimeBar />
        <RPSSelection />
      </Left>

      <Right>
        <FirstPlace place={state.gameList[0]} />
        <MyPlace place={myPlace} />
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
