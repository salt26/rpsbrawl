import React, { useEffect } from "react";
import styled from "styled-components";
import { Medium } from "../../styles/font";
import LockSrc from "../../assets/images/lock.svg";
import SvgIcon from "../common/SvgIcon";
import GradientBtn from "./GradientBtn";
import { Language } from "../../db/Language";
import { LanguageContext } from "../../utils/LanguageProvider";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { WebsocketContext } from "../../utils/WebSocketProvider";
function Room({ room }) {
  const { id, name, has_password, state, max_persons, num_persons } = room;
  var navigate = useNavigate();
  const mode = useContext(LanguageContext);

  const [createSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 불러오기

  const joinBtnStyle = {
    width: "70px",
    height: "30px",
    borderRadius: "50px",
    bg: "linear-gradient(180deg, #3AB6BC 0%, #3A66BC 100%, #2F508E 100%);",
  };

  const playBtnStyle = {
    width: "70px",
    height: "30px",
    borderRadius: "50px",
    bg: "linear-gradient(180deg, #FA1515 0%, #F97916 100%);",
  };

  const _joinRoom = () => {
    // 방 입장 요청
    let request = {
      request: "join",
      room_id: id, // 입장하려는 방의 번호
      password: "", // 문자열 (빈 문자열을 보내면 비밀번호가 없는 방에 입장 가능)
    };
    ws.send(JSON.stringify(request));
  };

  return (
    <Box>
      <Row>
        <Medium color="white" size="25px">
          {name}
        </Medium>
        {has_password && <SvgIcon src={LockSrc} size="20px" />}
      </Row>
      <Row>
        <Medium color="white" size="20px">
          {num_persons}/{max_persons}
        </Medium>
        {state == 0 ? (
          <GradientBtn
            text={Language[mode].join}
            style={joinBtnStyle}
            onClick={() => _joinRoom("")}
          />
        ) : (
          <GradientBtn
            text={Language[mode].play}
            style={playBtnStyle}
            disabled
          />
        )}
      </Row>
    </Box>
  );
}

const Box = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #7b78d5;
  border-radius: 10px;
  height: 100px;
  padding: 20px;

  @media (max-width: 767px) {
    //모바일
    width: 100%;
  }

  @media (min-width: 1200px) {
    // 데스크탑 일반
    width: 45%;
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
export default Room;
