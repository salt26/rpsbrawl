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
import { history } from "../utils/history";
function RoomListPage() {
  const _backToHome = () => {
    if (ready) {
      let request = {
        request: "signout",
      };
      ws.send(JSON.stringify(request));
    }
  };
  useEffect(
    () => {
      const listenBackEvent = () => {
        // 뒤로가기 할 때 수행할 동작을 적는다

        _backToHome();
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

  const my_name = getUserName();
  var navigate = useNavigate();
  const { state } = useLocation(); // 방 목록 정보
  const [createSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 불러오기

  //방만들기
  const [CreateRoomModalVisible, setCreateRoomModalVisible] = useState(false);

  const [rooms, setRooms] = useState([]);
  const mode = useContext(LanguageContext);

  return (
    <RoomListPageLayout>
      <CreateRoomModal
        modalVisible={CreateRoomModalVisible}
        setModalVisible={setCreateRoomModalVisible}
      />

      <NavBar>
        <Back onClick={_backToHome} />

        <TitleContainer>
          <Medium shadow color="white" size="80px">
            {Language[mode].rooms}
          </Medium>
        </TitleContainer>
        <MyNameTag size="m" color="var(--yellow)">
          {my_name}
        </MyNameTag>
      </NavBar>
      <SizedBox height={"30px"} />
      <RoomList
        rooms={rooms}
        setCreateRoomModalVisible={setCreateRoomModalVisible}
      />
    </RoomListPageLayout>
  );
}
const NavBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  background-color: orange;
`;

const TitleContainer = styled.div`
  margin-left: 125px;
`;
const RoomListPageLayout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const Center = styled.div`
  align-self: center;
`;
export default RoomListPage;
