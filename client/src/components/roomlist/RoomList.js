import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Room from "./Room";
import GradientBtn from "./GradientBtn";
import SizedBox from "../common/SizedBox";
import { Language } from "../../db/Language";
import { LanguageContext } from "../../utils/LanguageProvider";
import { useContext } from "react";
import RefreshBtn from "./RefreshBtn";
import { WebsocketContext } from "../../utils/WebSocketProvider";
import { useNavigate, useParams } from "react-router-dom";
import { Medium } from "../../styles/font";
import { useMediaQuery } from "react-responsive";
function RoomList({ rooms, setCreateRoomModalVisible }) {
  const mode = useContext(LanguageContext);

  var navigate = useNavigate();
  const [roomLists, setRoomLists] = useState(rooms);

  const [createSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 불러오기
  const _enterRoom = (id, pwd) => {
    // 방 입장 요청
    let request = {
      request: "join",
      room_id: id, // 입장하려는 방의 번호
      password: pwd, // 문자열 (빈 문자열을 보내면 비밀번호가 없는 방에 입장 가능)
    };
    ws.send(JSON.stringify(request));
  };

  useEffect(() => {
    ws.onmessage = function (event) {
      const res = JSON.parse(event.data);

      if (ready) {
        if (res?.response === "error") {
          alert(res.message);
          return;
        }

        if (res.response === "error_refresh") {
          const enteredPassword = prompt("please enter password");
          if (enteredPassword !== null) {
            // 취소를 누르면 null반환
            _enterRoom(res.data.id, enteredPassword);
          }
        }
        switch (res?.type) {
          case "room_list": // 룸 목록 갱신 요청에 대한 응답
            setRoomLists(res.data);
            break;

          case "join_data": // 방장이 룸을 생성하거나 유저가 입장(Join) 요청 보낸경우
            navigate(`./${res.data.room.id}/waiting`, { state: res.data });

            break;
        }
      }
    };
  }, [ready]);
  const _openCreateRoomModal = () => {
    setCreateRoomModalVisible(true);
  };

  const _quickStart = () => {
    var enter_id = 0;
    var room_num = 0;

    do {
      if (room_num === roomLists.length) {
        alert(Language[mode].quick_start_limit_text);

        break;
      }
      enter_id = roomLists[room_num].id; // 들어갈 방의 고유 id

      if (roomLists[room_num].has_password === false) {
        // 비번 없는 방을 찾으면 입장 요청
        let request = {
          request: "join",
          room_id: enter_id,
          password: "",
        };

        ws.send(JSON.stringify(request));
        break;
      }

      room_num += 1;
    } while (true);
  };

  const blueBtnStyle = {
    width: "130px",
    height: "40px",
    borderRadius: "10px",
    bg: "linear-gradient(180deg, #3AB6BC 0%, #3A66BC 100%, #2F508E 100%);",
  };
  const redBtnStyle = {
    width: "130px",
    height: "40px",
    borderRadius: "10px",
    bg: "linear-gradient(180deg, #FA1515 0%, #F97916 100%);",
  };

  const _refreshRoomList = () => {
    if (ready) {
      let request = {
        request: "refresh",
      };
      ws.send(JSON.stringify(request));
    }
  };

  const isMobile = useMediaQuery({ query: "(max-width:768px)" });

  return (
    <BgBox width="100%" height="80%">
      <Row>
        <div
          style={{
            display: "flex",
            width: isMobile ? "100%" : "auto",
            flexDirection: "row",
            gap: "30px",
          }}
        >
          <GradientBtn
            text={Language[mode].create_room}
            onClick={_openCreateRoomModal}
            style={blueBtnStyle}
            anim
          />

          <GradientBtn
            text={Language[mode].quick_start}
            onClick={_quickStart}
            style={redBtnStyle}
            anim
          />
        </div>

        <RefreshBtn onClick={_refreshRoomList} />
      </Row>
      <SizedBox width="100%" height={"20px"} />
      {roomLists.length === 0 && (
        <Anim>
          <Medium color="white" size="30px">
            {Language[mode].no_room_text}
          </Medium>
        </Anim>
      )}
      <RoomContainer>
        {roomLists.map((room) => (
          <Room room={room} key={room.id} />
        ))}
      </RoomContainer>
    </BgBox>
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
const BgBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;

  align-self: center;
  margin: auto;
  margin-top: 5%;
  background: rgba(123, 120, 213, 0.22);
  width: 100%;
  height: 500px;
  padding: 40px;
  border-radius: 10px;

  @media (max-width: 767px) {
    //모바일
    width: 80%;
    height: 65%;
  }
  @media (min-width: 1200px) {
    // 데스크탑 일반
    width: 50%;
  }
`;

const RoomContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  height: 70%;
  overflow-y: auto;

  @media (min-width: 1200px) {
    // 데스크탑 일반
    padding-right: 15px;
  }
  grid-gap: 30px 20px;
  ::-webkit-scrollbar {
    width: 15px; /* 스크롤바의 너비 */
  }

  ::-webkit-scrollbar-thumb {
    background: #f5f5f5; /* 스크롤바의 색상 */

    border-radius: 10px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(33, 122, 244, 0.1); /*스크롤바 뒷 배경 색상*/
  }
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;

  gap: 20px;
`;
export default RoomList;
