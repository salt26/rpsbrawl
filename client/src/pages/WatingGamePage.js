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
import { TIME_DURATION, TIME_OFFSET } from "../Config";
import { PASSWORD } from "../Config";
import { Language } from "../db/Language";
import { LanguageContext } from "../utils/LanguageProvider";
import { MediumOutline } from "../styles/font";
import TeamSelection from "../components/gameroom/TeamSelection";
import AddBot from "../components/gameroom/AddBot";
import SvgIcon from "../components/common/SvgIcon";
import LockSrc from "../assets/images/lock.svg";
import SettingSrc from "../assets/images/setting.svg";
import CreateRoomModal from "../components/gameroom/CreateRoomModal";

export default function WatingGamePage() {
  const { room_id } = useParams();
  const { state } = useLocation(); // 유저 목록 정보

  const mode = useContext(LanguageContext);

  const [numberOfUser, setNumberOfUser] = useState(1);
  const [users, setUsers] = useState([]);
  const [room, setRoom] = useState(null); //Room정보
  const [handList, setHandList] = useState(null);
  const [gameList, setGameList] = useState(null);
  const [roomTitle, setRoomTitle] = useState("Welcome");
  const [settingModalVisible, setSettingModalVisible] = useState(false); //설정창

  const [myTeam, setMyTeam] = useState("red");

  // ! 관리자 여부 -> bool이 아니라 string임에 유의(js는 "false" 를 true로 판단)!
  const isAuthorized =
    localStorage.getItem("is_admin") === "true" &&
    localStorage.getItem("password") === PASSWORD;

  console.log(isAuthorized);
  const person_id = getUserId();
  const person_name = getUserName();
  var navigate = useNavigate();

  const [createSocketConnection, ready, res, send] =
    useContext(WebsocketContext); //전역 소켓 불러오기

  useEffect(() => {
    /*
    if (ready) {
      console.log(res.type, res.data);

      if (res?.response === "error") {
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
    */
  }, [res]); // 메시지가 바뀔때마다

  const _quitGame = () => {
    if (ready) {
      let request = {
        request: "quit",
      };

      send(JSON.stringify(request));
      navigate("/rooms");
      localStorage.removeItem("is_admin");
    }
    navigate("/rooms");
  };

  const _startGame = () => {
    console.log(ready);
    if (ready) {
      let request = {
        request: "start",
        time_offset: TIME_OFFSET, // seconds, 플레이 중인 방으로 전환 후 처음 손을 입력받기까지 기다리는 시간
        time_duration: TIME_DURATION, // seconds, 처음 손을 입력받기 시작한 후 손을 입력받는 시간대의 길이
      };

      send(JSON.stringify(request));
    }
    //navigate(`/room/${room_id}/game`);
    navigate(`/rooms/1/game`);
  };
  return (
    <Container>
      <CreateRoomModal
        modalVisible={settingModalVisible}
        setModalVisible={setSettingModalVisible}
      />
      <TitleContainer>
        <Row2>
          <Medium color="white" size="25px">
            15 / 50
          </Medium>
          <SvgIcon src={LockSrc} size="20px" />
        </Row2>
        <BgBox bgColor={"white"} width="230px" height="50px">
          <Medium color="#6E3D9D">{roomTitle}</Medium>
        </BgBox>
      </TitleContainer>
      <Anim>
        <MediumOutline
          color="
#6E3D9D"
          size={"60px"}
        >
          {Language[mode].ingame_title_text}
        </MediumOutline>
      </Anim>

      <MediumOutline
        color="
#6E3D9D"
        size={"30px"}
      >
        {Language[mode].ingame_describe_text(numberOfUser)}
      </MediumOutline>

      <Row>
        <Sector>
          <Col>
            <TeamSelection setMyTeam={setMyTeam} />

            <Button text={Language[mode].quit} onClick={_quitGame} />
          </Col>
        </Sector>
        <SizedBox width={"50px"} />
        <Sector>
          <BgBox bgColor={"var(--light-purple)"} width="950px" height="500px">
            <UserList users={users} />
          </BgBox>
        </Sector>
        <SizedBox width={"50px"} />

        <Sector>
          <Col>
            <SettingContainer>
              <SvgIcon
                src={SettingSrc}
                size="40px"
                onClick={() => setSettingModalVisible(true)}
              />
            </SettingContainer>
            <AddBot />
            {isAuthorized ? (
              <Button
                text={Language[mode].start}
                onClick={_startGame}
                bgColor="var(--red)"
              />
            ) : (
              <></>
            )}
          </Col>
        </Sector>
      </Row>
    </Container>
  );
}
const Anim = styled.div`
  animation: ani 0.5s infinite alternate;
  @keyframes ani {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(0, -5px);
    }
  }
`;
const TitleContainer = styled.div`
  position: absolute;
  z-index: 1;
  left: 0;
  top: 50px;
`;

const SettingContainer = styled.div`
  position: absolute;
  z-index: 1;
  right: 0;
  top: -130px;
`;
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

const Row2 = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Col = styled.div`
  display: flex;

  flex-direction: column;
  height: 500px;
  position: relative;
  align-items: center;
  justify-content: space-between;
`;
const Sector = styled.div`
  flex: 0.3;
  display: flex;
  justify-content: center;
  align-items: center;
`;
