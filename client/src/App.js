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

import PrivateRoute from "./utils/PrivateRoute";
import { Navigate } from "react-router-dom";

import Header from "./components/Header";

const Background = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #524fa1 0%, #3b36cf 100%);
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
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

  return (
    <LanguageContext.Provider value={mode}>
      <WebsocketProvider>
        <Background>
          <BrowserView
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Header />
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
          </BrowserView>
          <MobileView style={{ width: "100%", height: "100%" }}>
            <Header />
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
          </MobileView>
        </Background>
      </WebsocketProvider>
    </LanguageContext.Provider>
  );
}

export default App;
