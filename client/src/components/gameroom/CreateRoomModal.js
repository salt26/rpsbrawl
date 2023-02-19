import React, { useState, useContext, useEffect } from "react";
import ReactModal from "react-modal";
import styled from "styled-components";
import { Medium } from "../../styles/font";
import SvgIcon from "../common/SvgIcon";
import GameSrc from "../../assets/images/game.svg";
import LockSrc from "../../assets/images/lock_black.svg";
import CheckSrc from "../../assets/images/check.svg";
import UnCheckSrc from "../../assets/images/uncheck.svg";
import QuestionSrc from "../../assets/images/question.svg";
import SizedBox from "../common/SizedBox";
import GradientBtn from "../roomlist/GradientBtn";
import { Tooltip } from "react-tooltip";
import { WebsocketContext } from "../../utils/WebSocketProvider";
import { useNavigate } from "react-router-dom";

function CreateRoomModal({ modalVisible, setModalVisible, mode }) {
  const [roomTitle, setRoomTitle] = useState("");
  const [gameMode, setGameMode] = useState(0);
  const [privateMode, setPrivateMode] = useState(false);
  const [password, setPassword] = useState("");
  const [createWebSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 사용

  var navigate = useNavigate();
  const blueBtnStyle = {
    fontSize: "25px",
    width: "40%",
    height: "40px",
    borderRadius: "10px",
    bg: "linear-gradient(180deg, #3AB6BC 0%, #3A66BC 100%, #2F508E 100%);",
  };
  const redBtnStyle = {
    fontSize: "25px",
    width: "40%",
    height: "40px",
    borderRadius: "10px",
    bg: "linear-gradient(180deg, #FA1515 0%, #F97916 100%);",
  };

  const _createRoom = () => {
    if (password.length > 20) {
      alert("Please set the password  no more than 20 characters.");
      return;
    }

    if (roomTitle.length > 32) {
      alert("Please set the title  no more than 32 characters.");
      return;
    }
    let request = {
      request: "create",
      room_name: roomTitle, // 이름은 다른 방과 겹쳐도 무관, 빈 문자열이 아니고 32글자 이내여야 함
      mode: gameMode, // 0은 일반 모드, 1은 연속해서 같은 손을 입력할 수 없는 모드
      password: privateMode ? password : "", // 비밀번호가 없는 경우 ""(빈 문자열) 전송할 것, 20글자 이내여야 함
    };
    ws.send(JSON.stringify(request));
    console.log(request);
    setModalVisible(false);
  };
  useEffect(() => {
    ws.onmessage = function (event) {
      const res = JSON.parse(event.data); // 전달된 json string을 object로 변환

      if (ready) {
        if (res?.response === "error") {
          alert(res.message);
          return;
        }
      }
    };
  }, [ready]);
  return (
    <ReactModal
      ariaHideApp={false}
      isOpen={modalVisible}
      style={{
        overlay: {
          width: "30%",
          height: "40%",
          top: "25%",
          left: "35%",

          backgroundColor: "transparent",
        },
        content: {
          width: "100%",
          height: "100%",
          padding: 0,
          borderRadius: "10px",
          backgroundColor: "white",

          border: "3px solid transparent",
          backgroundImage: `linear-gradient(#fff, #fff),
    linear-gradient(180deg, #3ab6bc 0%, #3a66bc 100%, #2f508e 100%)`,

          backgroundOrigin: `border-box`,
          backgroundClip: `content-box, border-box`,
        },
      }}
    >
      <TitleBox>
        <Medium size="30px" color="white">
          {"Create Room"}
        </Medium>
      </TitleBox>
      <Container>
        <SizedBox height={"15px"} />
        <input
          type={"text"}
          value={roomTitle}
          onChange={(e) => setRoomTitle(e.target.value)}
          style={{
            width: "100%",
            height: "50px",
            borderColor: "var(--border)",
            fontSize: "35px",
            fontFamily: "KOTRAHOPE",
          }}
        />
        <SizedBox height={"15px"} />
        <Row>
          <SvgIcon src={GameSrc} size="30px" />
          <Medium size="30px" color="black">
            Mode
          </Medium>
          {gameMode === 0 ? (
            <SvgIcon src={CheckSrc} size="20px" />
          ) : (
            <SvgIcon
              src={UnCheckSrc}
              size="20px"
              onClick={() => setGameMode(0)}
            />
          )}
          <Medium size="25px" color="black">
            Normal
          </Medium>

          {gameMode === 1 ? (
            <SvgIcon src={CheckSrc} size="20px" />
          ) : (
            <SvgIcon
              src={UnCheckSrc}
              size="20px"
              onClick={() => setGameMode(1)}
            />
          )}
          <Medium size="25px" color="black">
            Limited
          </Medium>

          <img
            src={QuestionSrc}
            width="20px"
            height="20px"
            id="my-anchor-element"
          />
          {/** <Tooltip
            anchorId="my-anchor-element"
            content="You can not throw same hand in succession."
            place="right"
            style={{ zIndex: 100 }}
            
          />*/}
        </Row>
        <SizedBox height={"5px"} />
        <Row>
          <SvgIcon src={LockSrc} size="30px" />
          <Medium size="30px" color="black">
            Private room
          </Medium>

          {privateMode ? (
            <SvgIcon
              src={CheckSrc}
              size="20px"
              onClick={() => setPrivateMode((prev) => !prev)}
            />
          ) : (
            <SvgIcon
              src={UnCheckSrc}
              size="20px"
              onClick={() => setPrivateMode((prev) => !prev)}
            />
          )}
          {privateMode ? (
            <input
              type={"password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "30%",
                height: "30px",
                borderColor: "var(--border)",
                fontFamily: "KOTRAHOPE",
                fontSize: "20px",
              }}
            />
          ) : (
            <div style={{ width: "30%", height: "30px" }}></div>
          )}
        </Row>
        <SizedBox height={"15px"} />
        <Row>
          <GradientBtn
            text={"Confirm"}
            style={blueBtnStyle}
            anim
            onClick={_createRoom}
          />
          <GradientBtn
            text="Cancel"
            style={redBtnStyle}
            anim
            onClick={() => setModalVisible(false)}
          />
        </Row>
      </Container>
    </ReactModal>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  align-items: center;

  padding-left: 50px;
  padding-right: 50px;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
const TitleBox = styled.div`
  background: linear-gradient(180deg, #3ab6bc 0%, #3a66bc 100%, #2f508e 100%);
  border-radius: 5px;
  width: 100%;
  height: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Hover = styled.div`
  &:hover {
  }
`;
export default CreateRoomModal;
