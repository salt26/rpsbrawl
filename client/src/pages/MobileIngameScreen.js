import React, { useState, useCallback, useRef } from "react";
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
import { getUserId } from "../utils/User";
import MessageBox from "../components/gameroom/MessageBox";
import { useMediaQuery } from "react-responsive";
import { Language } from "../db/Language";
import { LanguageContext } from "../utils/LanguageProvider";
import { Medium, GradientText } from "../styles/font";
import SizedBox from "../components/common/SizedBox";

export default function MobileInGameScreen() {
  const SHOW_TIME = 1; // 메시지 나타나는 시간 초
  const { state } = useLocation(); // 손 목록 정보, 게임 전적 정보
  const user_id = getUserId();

  const mode = useContext(LanguageContext);
  const isMobile = useMediaQuery({ query: "(max-width:768px)" });

  const lastHand = useRef(state["hand_list"][state.hand_list.length - 1].hand);

  //const handList = useRef(state["hand_list"]);
  const [handList, setHandList] = useState(state["hand_list"]);
  const [scoreTime, setScoreTime] = useState(0);
  const [lastScore, setLastScore] = useState(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [count, setCount] = useState(state["room"].time_offset); //게임 시작까지 남은 시간
  const [roomInfo, setRoomInfo] = useState(state["room"]);
  const [msg, setMsg] = useState("");
  const [showTime, setShowTime] = useState(false);

  const _getTimeOffset = (room) => {
    const current = new Date();
    var start = new Date(room["init_time"].slice(0, 19));
    start.setSeconds(start.getSeconds() + room["time_offset"]);
    var left = parseInt((start.getTime() - current.getTime()) / 1000);

    if (left < 0) {
      // 화면 넘어가는데 지연이 너무 오래걸린 경우 바로 게임 시작
      setIsWaiting(false); //게임 시작
    } else {
      setCount(left); //타이머 초깃값 세팅
    }
  };

  useInterval(
    () => {
      // 로컬에서는 방법1이 더 정확한 것 같은데..

      // 방법1. 매 초마다 현재시간과 동기화
      _getTimeOffset(roomInfo);

      // 방법2. 시작타임 맞추고 매초마다 1씩 줄여나가기 (다만이경우 useInterval이 지연간격을 보장하지 못할 수 있음)

      /*
      setCount((prev) => {
        return prev - 1;
      });
     

      if (count === -10) {
        setIsWaiting(false); //게임시작
      }
  */
    },
    isWaiting ? 500 : null // 타이머 갱신 간격을 짧게하면 좀 더 정확하게 카운트다운이 가능
  );

  const my_name = getUserName();
  const navigate = useNavigate();

  const { room_id } = useParams();

  const _getMyTeam = (gameLists) => {
    // 내 팀 구하기
    for (var user of gameLists) {
      if (user.name === my_name) {
        return user.team;
      }
    }
    return 0; // red팀 디폴트
  };

  const myPlace = useRef({
    name: my_name,
    team: _getMyTeam(state["game_list"]),
    rank: 0,
    score: 0,
  });

  const firstPlace = useRef(state?.game_list[0]);

  useEffect(() => {
    _getTimeOffset(state.room);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      setShowTime(false); //스코어 내리기
    }, SHOW_TIME * 1000);

    return () => clearInterval(id);
  }, [showTime]);

  const [createSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 불러오기
  useEffect(() => {
    ws.onmessage = function (event) {
      const res = JSON.parse(event.data);
      console.log(res);

      if (ready) {
        if (res?.response === "error") {
          if (
            res.message === "Cannot play the same hand in a row (limited mode)."
          ) {
            setMsg(Language[mode].limited_text);
            setShowTime(true);
            return;
          }
          alert(res.message);
          return;
        }
        if (res?.request === "disconnected") {
          //기존 인원과 새인원 비교

          setMsg("Cannot play the same hand in a row (limited mode)");
          setShowTime(true);
        }

        switch (res.request) {
          case "hand": // 게임 전적 정보 갱신
            if (res.type === "hand_data") {
              myPlace.current = _findMyPlace(res.data.game_list);
              firstPlace.current = res.data.game_list[0];
              handList.current = res.data.hand_list;
              const len = res.data.hand_list.length;

              lastHand.current = res.data.hand_list[len - 1].hand; // 가장 최근에 입력된 손 갱신
              setHandList(res.data.hand_list);
              if (res.data.hand_person_id == user_id) {
                //내가 득점한 정보
                setLastScore(res.data.last_hand[user_id][1]);
                setScoreTime(true);
                const id = setTimeout(() => {
                  setScoreTime(false); //쿨타임해제
                }, 1000);
              }
            }

            break;

          case "end": // 게임 종료 신호
            if (res.type === "hand_data") {
              navigate(`/rooms/${room_id}/result`, {
                // 결과화면으로 최종 전적정보 전달
                state: res.data, //room, hand_list, game_list
              });
            }
            break;
          case "start":
            if (res.type === "room_start") {
              setRoomInfo(res.data);
            }

            break;
        }
      }
    };
  }, [ready]);

  const _findMyPlace = (gameList) => {
    for (var user of gameList) {
      if (user.name === my_name) {
        //  이름이 같으면
        return user;
      }
    }

    return { name: "없음", team: "찾을수없음", rank: 0 };
  };

  return (
    <CountDownWrapper isWaiting={isWaiting}>
      <Col>
        {showTime && <MessageBox>{msg}</MessageBox>}

        <TimeBar roomInfo={roomInfo} />

        <Row>
          <FirstPlace place={firstPlace.current} />
          <MyPlace place={myPlace.current} />
        </Row>
        <RPSSelection lastHand={lastHand.current} />
        <ScoreContainer scoreTime={scoreTime}>
          {lastScore >= 0 ? (
            lastScore === 0 ? (
              <GradientText
                bg={
                  "linear-gradient(180deg, #3AB6BC 0%, #3A66BC 100%, #2F508E 100%);"
                }
                size="100px"
              >
                {lastScore}
              </GradientText>
            ) : (
              <GradientText
                bg={"linear-gradient(180deg, #BDFF00 0%, #F1D22E 100%);"}
                size="100px"
              >
                +{lastScore}
              </GradientText>
            )
          ) : (
            <GradientText
              bg={"linear-gradient(180deg, #FA1515 0%, #F97916 100%);"}
              size="100px"
            >
              {lastScore}
            </GradientText>
          )}
        </ScoreContainer>
        <NetworkLogs logs={handList} />
        <SizedBox height={"10px"} />
      </Col>
      <Count isWaiting={isWaiting}>{count}</Count>
    </CountDownWrapper>
  );
}
const ScoreContainer = styled.text`
  position: absolute;
  z-index: 5;

  ${({ scoreTime }) => {
    if (scoreTime) {
      css`
        display: block;
      `;
    } else {
      // scoreTime이 지나면

      return css`
        display: none;
      `;
    }
  }}
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 15;
`;
const CountDownWrapper = styled.div`
  position: relative;
  width: 100%;
  pointer-events: ${({ isWaiting }) =>
    isWaiting ? "none" : "auto"}; // 터치 불가능하도록
  height: 100%;

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

  display: ${({ isWaiting }) => (isWaiting ? "inline" : "none")};

  font-family: "KOTRAHOPE";
  color: red;
  z-index: 5;

  //모바일
  font-size: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;

  align-items: center;
  width: 100%;
  height: 100vh;

  padding: 10px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 100px;
`;
