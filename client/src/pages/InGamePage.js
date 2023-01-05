import React, { useState } from "react";
import styled, { css } from "styled-components";
import FirstPlace from "../components/gameroom/FirstPlace";
import MyPlace from "../components/gameroom/MyPlace";
import NetworkLogs from "../components/gameroom/NetworkLogs";
import TimeBar from "../components/gameroom/TimeBar";
import RPSSelection from "../components/gameroom/RPSSelection";
import { useLocation } from "react-router-dom";
import { WebsocketContext } from "../utils/WebSocketProvider";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserName, getUserAffiliation } from "../utils/User";
import { useParams } from "react-router-dom";
import useInterval from "../utils/useInterval";

export default function InGamePage() {
  const { state } = useLocation(); // 손 목록 정보, 게임 전적 정보

  const [lastHand, setLastHand] = useState(
    state["hand_list"][state.hand_list.length - 1].hand
  );

  const [handList, setHandList] = useState(state["hand_list"]);
  console.log(handList);
  const [isWaiting, setIsWaiting] = useState(true);
  const [count, setCount] = useState(5); //게임 시작까지 남은 시간

  const _getTimeOffset = (room) => {
    // init_time 기준으로 카운트다운 sync 맞추기
    // 형식 => 2023-01-03 00:35:41.029853 KST
    const current = new Date();
    var init = new Date(room["init_time"].slice(0, 19));
    var offset = current.getTime() - init.getTime();
    const left = 5 - parseInt(offset / 1000);
    if (left <= 0) {
      // 화면 넘어가는데 지연이 너무 오래걸린 경우 바로 게임 시작
      setIsWaiting(false); //게임 시작
    } else {
      setCount(room["time_offset"] - parseInt(offset / 1000)); //타이머 초깃값 세팅
    }
  };

  useInterval(
    () => {
      setCount((prev) => {
        return prev - 1;
      });

      if (count === 1) {
        setIsWaiting(false); //게임시작
      }
    },
    isWaiting ? 1000 : null
  );

  const my_name = getUserName();
  const navigate = useNavigate();
  const my_affiliation = getUserAffiliation();
  const { room_id } = useParams();
  const [myPlace, setMyPlace] = useState({
    name: my_name,
    affiliation: my_affiliation,
    rank: 0,
    score: 0,
  });

  const [firstPlace, setFirstPlace] = useState(state?.game_list[0]);

  const [createSocketConnection, ready, res, send] =
    useContext(WebsocketContext); //전역 소켓 불러오기

  useEffect(() => {
    _getTimeOffset(state.room);
  }, []);

  useEffect(() => {
    if (ready) {
      switch (res.request) {
        case "hand": // 게임 전적 정보 갱신
          if (res.type === "hand_data") {
            setMyPlace(_findMyPlace(res.data.game_list));
            setFirstPlace(res.data.game_list[0]);
            setHandList(res.data.hand_list);

            const len = res.data.hand_list.length;
            console.log(res.data.hand_list[len - 1]);
            setLastHand(res.data.hand_list[len - 1].hand); // 가장 최근에 입력된 손 갱신
            console.log(res.data.hand_list[len - 1].hand);
          }
          break;
        case "end": // 게임 종료 신호
          if (res.type === "hand_data") {
            navigate(`/room/${room_id}/result`, {
              // 결과화면으로 최종 전적정보 전달
              state: {
                handList: res.data.hand_list,
                gameList: res.data.game_list,
              },
            });
          }
      }
    }
  }, [res]); // 메시지가 도착하면

  const _findMyPlace = (gameList) => {
    for (var user of gameList) {
      if (user.name === my_name && user.affiliation === my_affiliation) {
        // 소속, 이름이 같으면
        return user;
      }
    }

    return { name: "없음", affiliation: "찾을수없음", rank: 0 };
  };

  return (
    <CountDownWrapper isWaiting={isWaiting}>
      <Container>
        <Left>
          <TimeBar duration={state.room["time_duration"]} />
          <RPSSelection lastHand={lastHand} />
        </Left>

        <Right>
          <FirstPlace place={firstPlace} />
          <MyPlace place={myPlace} />
          <NetworkLogs logs={handList} />
        </Right>
      </Container>
      <Count isWaiting={isWaiting}>{count}</Count>
    </CountDownWrapper>
  );
}

const CountDownWrapper = styled.div`
  position: relative;
  pointer-events: ${({ isWaiting }) =>
    isWaiting ? "none" : "auto"}; // 터치 불가능하도록

  z-index: 3;
  ${({ isWaiting }) =>
    isWaiting &&
    css`
      filter: alpha(opacity=40);
      opacity: 0.4;
      -moz-opacity: 0.4;
      background: rgba(217, 217, 217, 72) repeat;
    `}
`;

const Count = styled.text`
  position: absolute;
  font-size: 500px;
  display: ${({ isWaiting }) => (isWaiting ? "inline" : "none")};

  top: 20%;
  left: 45%;
  font-family: "KOTRAHOPE";
  color: red;
  z-index: 5;
`;
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
