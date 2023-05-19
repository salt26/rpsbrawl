import {
  GameResultPage,
  InGamePage,
  LandingPage,
  WatingGamePage,
  GameRoomPage,
  RoomListPage,
  MobileLandingScreen,
  MobileGameRoomScreen,
  MobileRoomListScreen,
} from "./pages";
import { Route, Routes } from "react-router-dom";
import styled from "styled-components";
import "./App.css";
import { useState, useRef, useEffect, createContext } from "react";
import { WebsocketContext } from "./utils/WebSocketProvider";
import { WebsocketProvider } from "./utils/WebSocketProvider";
import { Language } from "./db/Language";
import { LanguageContext } from "./utils/LanguageProvider";
import Toggle from "./components/Toggle";
import { useLocation } from "react-router-dom";
import { BrowserView, MobileView } from "react-device-detect";
import WatingMusicSrc from "../src/assets/bgm/Melody_of_travel_fluttering_ver..mp3";
import GameMusicSrc from "../src/assets/bgm/Melody_of_tongtong.mp3";
import PrivateRoute from "./utils/PrivateRoute";
import { Navigate } from "react-router-dom";
import TutorialBtn from "./components/common/TutorialBtn";
import TutorialModal from "./components/common/TutorialModal";
import SvgIcon from "./components/common/SvgIcon";
import MusicOnSrc from "./assets/images/music_on.png";
import MusicOffSrc from "./assets/images/music_off.png";
import Github from "./components/Github";
const Background = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #524fa1 0%, #3b36cf 100%);
`;

function App() {
  const savedMode = Number(localStorage.getItem("language_mode"));

  //언어 모드
  const [mode, setMode] = useState(savedMode === null ? 0 : savedMode);
  const { pathname } = useLocation();

  const params = pathname.split("/");

  const [inGame, setInGame] = useState(false);
  const [audioAllowed, setAudioAllowed] = useState(false);
  const [tutorialModalVisible, setTutorialModalVisible] = useState(false);
  useEffect(() => {
    if (params[3] === "game" || params[3] === "result") {
      setInGame(true);
    } else {
      setInGame(false);
    }
  });

  const inGameAudio = useRef(null);
  const basicAudio = useRef(null);

  const onPlayMusic = () => {
    setAudioAllowed(true);

    basicAudio.current.play();
  };

  const onPauseMusic = () => {
    setAudioAllowed(false);

    basicAudio.current.pause();
  };

  const audioIconShow = pathname === "/" || params[3] === "waiting";

  const musicIconStyle = {
    cursor: "pointer",
    position: "absolute",
    top: "3%",
    right: "2%",
  };
  const mobileMusicIconStyle = {
    cursor: "pointer",
    position: "absolute",
    top: "3%",
    left: "8%",
  };

  return (
    <LanguageContext.Provider value={mode}>
      <WebsocketProvider>
        <BrowserView>
          <Background>
            {inGame ? (
              <audio
                src={GameMusicSrc}
                autoPlay={audioAllowed}
                loop={true}
                ref={inGameAudio}
              ></audio>
            ) : (
              <audio
                src={WatingMusicSrc}
                loop={true}
                autoPlay={audioAllowed}
                ref={basicAudio}
              ></audio>
            )}
            {audioIconShow ? (
              audioAllowed ? (
                <img
                  src={MusicOnSrc}
                  onClick={onPauseMusic}
                  width={"40px"}
                  style={musicIconStyle}
                />
              ) : (
                <img
                  src={MusicOffSrc}
                  onClick={onPlayMusic}
                  width={"40px"}
                  style={musicIconStyle}
                />
              )
            ) : (
              <></>
            )}

            {pathname == "/" && (
              <TutorialBtn
                setTutorialModalVisible={setTutorialModalVisible}
                tutorialModalVisible={tutorialModalVisible}
              />
            )}
            <TutorialModal
              modalVisible={tutorialModalVisible}
              setModalVisible={setTutorialModalVisible}
            />
            {pathname == "/" && <Toggle mode={mode} setMode={setMode} />}
            <Routes>
              <Route path="/" element={<LandingPage />} />

              <Route element={<PrivateRoute />}>
                <Route path="/rooms" element={<RoomListPage />} />
                <Route
                  path="/rooms/:room_id/*"
                  element={
                    <GameRoomPage
                      inGameAudio={inGameAudio}
                      basicAudio={basicAudio}
                      setAudioAllowed={setAudioAllowed}
                    />
                  }
                />
                <Route
                  path={"/*"}
                  element={() => {
                    alert(Language[mode].page_not_found);
                    return <Navigate to="/" />;
                  }}
                />
              </Route>
              <Route
                path={"/*"}
                element={() => {
                  alert(Language[mode].page_not_found);
                  return <Navigate to="/" />;
                }}
              />
            </Routes>
          </Background>
        </BrowserView>
        <MobileView>
          <Background>
            {inGame ? (
              <audio
                src={GameMusicSrc}
                autoPlay={audioAllowed}
                loop={true}
                ref={inGameAudio}
              ></audio>
            ) : (
              <audio
                src={WatingMusicSrc}
                loop={true}
                autoPlay={audioAllowed}
                ref={basicAudio}
              ></audio>
            )}
            {audioIconShow ? (
              audioAllowed ? (
                <img
                  src={MusicOnSrc}
                  onClick={onPauseMusic}
                  width={"30px"}
                  style={mobileMusicIconStyle}
                />
              ) : (
                <img
                  src={MusicOffSrc}
                  onClick={onPlayMusic}
                  width={"30px"}
                  style={mobileMusicIconStyle}
                />
              )
            ) : (
              <></>
            )}

            {pathname === "/" && (
              <TutorialBtn
                setTutorialModalVisible={setTutorialModalVisible}
                tutorialModalVisible={tutorialModalVisible}
              />
            )}
            <TutorialModal
              modalVisible={tutorialModalVisible}
              setModalVisible={setTutorialModalVisible}
            />
            {pathname === "/" && <Toggle mode={mode} setMode={setMode} />}
            <Routes>
              <Route path="/" element={<MobileLandingScreen />} />

              <Route element={<PrivateRoute />}>
                <Route path="/rooms" element={<MobileRoomListScreen />} />
                <Route
                  path="/rooms/:room_id/*"
                  element={<MobileGameRoomScreen />}
                />
                <Route
                  path={"/*"}
                  element={() => {
                    alert(Language[mode].page_not_found);
                    return <Navigate to="/" />;
                  }}
                />
              </Route>
              <Route
                path={"/*"}
                element={() => {
                  alert(Language[mode].page_not_found);
                  return <Navigate to="/" />;
                }}
              />
            </Routes>
          </Background>
        </MobileView>
      </WebsocketProvider>{" "}
    </LanguageContext.Provider>
  );
}

export default App;
