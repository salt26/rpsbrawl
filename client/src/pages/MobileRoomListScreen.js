import React, { useEffect, useState } from "react";
import MyNameTag from "../components/common/MyNameTag";
import Back from "../components/roomlist/Back";
import RoomList from "../components/roomlist/RoomList";
import { Medium } from "../styles/font";
import styled from "styled-components";
import SizedBox from "../components/common/SizedBox";
import { Language } from "../db/Language";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../utils/LanguageProvider";
import { useContext } from "react";
import CreateRoomModal from "../components/gameroom/CreateRoomModal";
import { useLocation } from "react-router-dom";
import { WebsocketContext } from "../utils/WebSocketProvider";
import { getUserName } from "../utils/User";
function MobileRoomListScreen() {
  const my_name = getUserName();
  var navigate = useNavigate();
  const { state } = useLocation(); // 방 목록 정보
  const [createSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 불러오기
  const _backToHome = () => {
    if (ready) {
      let request = {
        request: "signout",
      };
      ws.send(JSON.stringify(request));
    }
  };

  //방만들기
  const [CreateRoomModalVisible, setCreateRoomModalVisible] = useState(false);

  const [rooms, setRooms] = useState(state);
  const mode = useContext(LanguageContext);

  return (
    <Col>
      <CreateRoomModal
        modalVisible={CreateRoomModalVisible}
        setModalVisible={setCreateRoomModalVisible}
      />
      <SizedBox height={"20px"} />
      <Medium shadow color="white" size="80px">
        {Language[mode].rooms}
      </Medium>
      <Back onClick={_backToHome} />
      <MyNameTag size="m" color="var(--yellow)">
        {my_name}
      </MyNameTag>
      <RoomList
        rooms={rooms}
        setCreateRoomModalVisible={setCreateRoomModalVisible}
      />
    </Col>
  );
}

const Col = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
`;

export default MobileRoomListScreen;
