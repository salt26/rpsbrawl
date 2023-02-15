import React, { useState } from "react";
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
function RoomListPage() {
  const nickname = "FLOWERSAYO";
  var navigate = useNavigate();

  //방만들기
  const [CreateRoomModalVisible, setCreateRoomModalVisible] = useState(false);

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
      <Back onClick={() => navigate("/")} />
      <MyNameTag size="m"> {nickname}</MyNameTag>
      <RoomList setCreateRoomModalVisible={setCreateRoomModalVisible} />
    </Col>
  );
}

const Col = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default RoomListPage;
