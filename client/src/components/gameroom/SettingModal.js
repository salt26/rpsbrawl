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
import { Language } from "../../db/Language";
import { LanguageContext } from "../../utils/LanguageProvider";
import { useMediaQuery } from "react-responsive";

function SettingModal({ modalVisible, setModalVisible, roomInfo }) {
  const [roomTitle, setRoomTitle] = useState(roomInfo.name);
  const [gameMode, setGameMode] = useState(roomInfo.mode);
  const [privateMode, setPrivateMode] = useState(roomInfo.has_password);
  const [password, setPassword] = useState("");
  const [createWebSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 사용

  const isMobile = useMediaQuery({ query: "(max-width:768px)" });
  const mode = useContext(LanguageContext);
  const blueBtnStyle = {
    fontSize: "var(--font-size-ml)",
    width: "40%",
    height: "40px",
    borderRadius: "10px",
    bg: "linear-gradient(180deg, #3AB6BC 0%, #3A66BC 100%, #2F508E 100%);",
  };
  const redBtnStyle = {
    fontSize: "var(--font-size-ml)",
    width: "40%",
    height: "40px",
    borderRadius: "10px",
    bg: "linear-gradient(180deg, #FA1515 0%, #F97916 100%);",
  };

  const _cancel = () => {
    setModalVisible(false);
  };

  const _modifyRoom = () => {
    if (password.length > 20) {
      alert(Language[mode].password_long);
      return;
    }

    if (roomTitle.length > 32) {
      alert(Language[mode].title_long);
      return;
    }

    if (password === "") {
      setPrivateMode(false);
    }
    let request = {
      request: "setting",
      name: roomTitle, // 빈 문자열이 아니고 32글자 이내여야 함
      mode: gameMode, // 0은 일반 모드, 1은 연속해서 같은 손을 입력할 수 없는 모드
      password: privateMode ? password : "", // 비밀번호를 없애는 경우 ""(빈 문자열) 전송할 것, 20글자 이내여야 함
    };

    ws.send(JSON.stringify(request));

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
      style={
        isMobile
          ? {
              overlay: {
                backgroundColor: "transparent",
              },
              content: {
                width: "90vw",
                backgroundColor: "red",
                height: "35vh",
                display: "flex",

                flexDirection: "column",
                justifyContent: "flex-start",
                overflow: "hidden",
                top: "30%",
                left: "5%",
                padding: 0,
                borderRadius: "10px",

                border: "3px solid transparent",
                backgroundImage: `linear-gradient(#fff, #fff),
    linear-gradient(180deg, #3ab6bc 0%, #3a66bc 100%, #2f508e 100%)`,

                backgroundOrigin: `border-box`,
                backgroundClip: `content-box, border-box`,
              },
            }
          : {
              overlay: {
                width: "500px",
                height: "300px",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%)`,
                backgroundColor: "transparent",
              },
              content: {
                width: "100%",
                height: "100%",
                padding: 0,
                borderRadius: "10px",
                backgroundColor: "white",
                overflow: "hidden",
                border: "3px solid transparent",
                backgroundImage: `linear-gradient(#fff, #fff),
    linear-gradient(180deg, #3ab6bc 0%, #3a66bc 100%, #2f508e 100%)`,

                backgroundOrigin: `border-box`,
                backgroundClip: `content-box, border-box`,
              },
            }
      }
    >
      <TitleBox>
        <Medium size="var(--font-size-xl)" color="white">
          {Language[mode].settings}
        </Medium>
      </TitleBox>
      <Container>
        <SizedBox height={"3vh"} />
        <input
          type={"text"}
          value={roomTitle}
          onChange={(e) => setRoomTitle(e.target.value)}
          style={{
            width: "100%",
            height: "30%",
            borderColor: "var(--border)",
            fontSize: "var(--font-size-xl)",
            fontFamily: "KOTRAHOPE",
          }}
        />
        <SizedBox height={"3vh"} />
        <Row>
          <Row2>
            <SvgIcon src={GameSrc} size="30px" />
            <Medium size="var(--font-size-ml)" color="black">
              {Language[mode].mode}
            </Medium>
          </Row2>
          <Row2>
            {gameMode === 0 ? (
              <SvgIcon src={CheckSrc} size="20px" />
            ) : (
              <SvgIcon
                src={UnCheckSrc}
                size="20px"
                onClick={() => setGameMode(0)}
              />
            )}
            <Medium size="var(--font-size-ml)" color="black">
              {Language[mode].normal}
            </Medium>
          </Row2>
          <Row2>
            {gameMode === 1 ? (
              <SvgIcon src={CheckSrc} size="20px" />
            ) : (
              <SvgIcon
                src={UnCheckSrc}
                size="20px"
                onClick={() => setGameMode(1)}
              />
            )}
            <Medium size="var(--font-size-ml)" color="black">
              {Language[mode].limited}
            </Medium>
          </Row2>
          <img
            src={QuestionSrc}
            width="20px"
            height="20px"
            id="my-anchor-element"
          />

          <Tooltip
            anchorId="my-anchor-element"
            content={Language[mode].limited_text}
            place="right"
            style={{ zIndex: 100 }}
          />
        </Row>
        <SizedBox height={"5px"} />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "10px",
            width: "100%",
          }}
        >
          <SvgIcon src={LockSrc} size="30px" />
          <Medium size="var(--font-size-ml)" color="black">
            {Language[mode].privateRoom}
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
          {privateMode && (
            <input
              type={"password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "30%",
                height: "30px",
                borderColor: "var(--border)",
                fontFamily: "KOTRAHOPE",
                fontSize: "var(--font-size-md)",
              }}
            />
          )}
        </div>
        <SizedBox height={"3vh"} />
        <Row>
          <GradientBtn
            text={Language[mode].cancel}
            style={blueBtnStyle}
            anim
            onClick={_cancel}
          />
          <GradientBtn
            text={Language[mode].update}
            style={redBtnStyle}
            anim
            onClick={_modifyRoom}
          />
        </Row>
        <SizedBox height={"3vh"} />
      </Container>
    </ReactModal>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  overflow: hidden;

  @media (max-width: 767px) {
    //모바일
    padding-left: 10px;
    padding-right: 10px;
  }

  @media (min-width: 1200px) {
    // 데스크탑 일반
    padding-left: 40px;
    padding-right: 40px;
  }
`;

const Row = styled.div`
  display: flex;
  width: 100%;

  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Row2 = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;
const TitleBox = styled.div`
  background: linear-gradient(180deg, #3ab6bc 0%, #3a66bc 100%, #2f508e 100%);
  border-radius: 5px;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default SettingModal;
