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
import { RESULT_TIME, TIME_DURATION, TIME_OFFSET } from "../Config";
import { PASSWORD } from "../Config";
import { Language } from "../db/Language";
import { LanguageContext } from "../utils/LanguageProvider";
import { MediumOutline } from "../styles/font";
import TeamSelection from "../components/gameroom/TeamSelection";
import AddBot from "../components/gameroom/AddBot";
import SvgIcon from "../components/common/SvgIcon";
import LockSrc from "../assets/images/lock.svg";
import SettingSrc from "../assets/images/setting.svg";
import SettingModal from "../components/gameroom/SettingModal";
import { history } from "../utils/history";
import NormalIconSrc from "../assets/images/normal.png";
import BanIconSrc from "../assets/images/ban.png";
import { useMediaQuery } from "react-responsive";

function TeamsBtn({ setTeamSelectionVisible }) {
  const _toggleTeamSelection = () => {
    setTeamSelectionVisible((prev) => !prev);
  };
  const mode = useContext(LanguageContext);
  return (
    <BgBox
      bgColor={"var(--light-purple)"}
      width="45%"
      height="30px"
      onClick={_toggleTeamSelection}
    >
      <MediumOutline color="#6E3D9D" size={"20px"}>
        {Language[mode].team}
      </MediumOutline>
    </BgBox>
  );
}

function AddBotBtn({ setAddBotVisible }) {
  const mode = useContext(LanguageContext);
  const _toggleAddBot = () => {
    setAddBotVisible((prev) => !prev);
  };
  return (
    <BgBox
      bgColor={"var(--light-purple)"}
      width="45%"
      height="30px"
      onClick={_toggleAddBot}
    >
      <MediumOutline color="#6E3D9D" size={"20px"}>
        {Language[mode].add_bot}
      </MediumOutline>
    </BgBox>
  );
}
export default function MobileWatingRoomScreen() {
  const { room_id } = useParams();
  const { state } = useLocation(); // 유저 목록 정보
  const [teamSelectionVisible, setTeamSelectionVisible] = useState(false);
  const [addBotVisible, setAddBotVisible] = useState(false);

  useEffect(
    () => {
      const listenBackEvent = () => {
        // 뒤로가기 할 때 수행할 동작을 적는다
        _quitGame();
      };

      const unlistenHistoryEvent = history.listen(({ action }) => {
        if (action === "POP") {
          // 뒤로가기
          listenBackEvent();
        } else if (action === "PUSH") {
          //앞으로가기
        }
      });

      return unlistenHistoryEvent;
    },
    [
      // effect에서 사용하는 state를 추가
    ]
  );
  //host인지 아닌지 판단
  const _findHost = (users) => {
    for (var user of users) {
      if (user.name === my_name) {
        if (user.is_host) {
          return true;
        } else {
          return false;
        }
      }
    }

    return false;
  };
  const mode = useContext(LanguageContext);
  const my_name = getUserName();
  const [users, setUsers] = useState(state.game_list);
  const [roomInfo, setRoomInfo] = useState(state.room); //Room정보
  const [isAdmin, setIsAdmin] = useState(_findHost(users));
  const [settingModalVisible, setSettingModalVisible] = useState(false); //설정창
  const [skilledBot, setSkilledBot] = useState(state.room.bot_skilled);
  const [dumbBot, setDumbBot] = useState(state.room.bot_dumb);

  console.log(_findHost(users));
  var navigate = useNavigate();

  const [createSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 불러오기
  useEffect(() => {
    ws.onmessage = function (event) {
      const res = JSON.parse(event.data);
      console.log(res);

      if (ready) {
        if (res?.response === "error") {
          alert(res.message);
          return;
        }

        switch (res?.type) {
          case "game_list": // 팀 변경 요청에 대한 응답 , 접속 끊겼을때
            setUsers(res.data);
            setIsAdmin(_findHost(res.data));

            if (res?.request === "quit") {
              setRoomInfo((prev) => {
                const newRoomInfo = { ...prev };
                newRoomInfo.num_persons -= 1; // 나간 인원 감소
                return newRoomInfo;
              });
            }

            break;
          case "room_list": // 룸 목록 갱신 요청에 대한 응답
            navigate("/rooms", { state: res.data });
            break;

          case "room": // 방 설정 변경 성공시
            setRoomInfo(res.data);

            /*
            if (isAdmin) {
              alert("방 설정이 성공적으로 변경되었습니다.");
            }
            */
            setSkilledBot(res.data.bot_skilled);
            setDumbBot(res.data.bot_dumb);

            break;
          case "join_data": // 새로운 사람 입장시
            setUsers(res.data.game_list);
            setRoomInfo(res.data.room);
            break;
          case "init_data": // 게임 시작시 정보
            navigate(`/rooms/${room_id}/game`, { state: res.data });
            break;
        }
      }
    };
  }, [ready]);

  const _quitGame = () => {
    if (ready) {
      let request1 = {
        request: "quit",
      };

      ws.send(JSON.stringify(request1));

      let request2 = {
        request: "refresh",
      };
      ws.send(JSON.stringify(request2));
    }
  };

  const _startGame = () => {
    if (ready) {
      let request = {
        request: "start",
        time_offset: TIME_OFFSET, // seconds, 플레이 중인 방으로 전환 후 처음 손을 입력받기까지 기다리는 시간
        time_duration: TIME_DURATION, // seconds, 처음 손을 입력받기 시작한 후 손을 입력받는 시간대의 길이
      };

      ws.send(JSON.stringify(request));
    }

    // navigate(`/rooms/1/game`);
  };

  const getTitleSize = (roomTitle) => {
    if (roomTitle.length <= 9) {
      return "50px";
    } else if (roomTitle.length <= 18) {
      return "25px";
    } else {
      return "20px";
    }
  };

  return (
    <Container>
      {teamSelectionVisible && <TeamSelection />}
      {addBotVisible && <AddBot skilledBot={skilledBot} dumbBot={dumbBot} />}
      <TitleContainer>
        <SettingModal
          modalVisible={settingModalVisible}
          setModalVisible={setSettingModalVisible}
          roomInfo={roomInfo}
        />

        <Row2>
          <Medium color="white" size="25px">
            {roomInfo.num_persons} / {roomInfo.max_persons}
          </Medium>
          <div style={{ display: "flex", gap: "5px" }}>
            {roomInfo.has_password && <SvgIcon src={LockSrc} size="20px" />}
            {roomInfo.mode === 0 ? (
              <SvgIcon src={NormalIconSrc} size="20px" />
            ) : (
              <SvgIcon src={BanIconSrc} size="20px" />
            )}
          </div>
        </Row2>

        <BgBox bgColor={"white"} width="230px" height="60px">
          <Medium color="#6E3D9D" size={getTitleSize(roomInfo.name)}>
            {roomInfo.name}
          </Medium>
        </BgBox>
        <SizedBox height={"10px"} />
        <Row2>
          <TeamsBtn setTeamSelectionVisible={setTeamSelectionVisible} />
          <AddBotBtn setAddBotVisible={setAddBotVisible} />
        </Row2>
      </TitleContainer>

      <BgBox width="100%" height={"70%"} bgColor={"var(--light-purple)"}>
        <UserList users={users} />
      </BgBox>
      <SizedBox height={"10px"} />
      <Row2>
        <Button text={Language[mode].quit} onClick={_quitGame} />
        {isAdmin && (
          <Button
            text={Language[mode].start}
            onClick={_startGame}
            bg={`linear-gradient(180deg, #FA1515 0%, #F97916 100%);`}
          />
        )}
      </Row2>
      <SettingContainer>
        {isAdmin && (
          <SvgIcon
            src={SettingSrc}
            size="40px"
            onClick={() => setSettingModalVisible(true)}
          />
        )}
      </SettingContainer>
    </Container>
  );
}

const TitleContainer = styled.div`
  position: absolute;
  z-index: 1;

  position: relative;
  margin-bottom: 20px;
`;

const SettingContainer = styled.div`
  position: absolute;
  z-index: 1;
  right: 30px;
  top: 20px;
`;

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 30px;

  justify-content: space-around;

  align-items: center;
`;

const Row2 = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
