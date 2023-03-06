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
import { BASE_WEBSOCKET_URL } from "./Config";
import styled from "styled-components";
import "./App.css";
import { useState, useRef, useEffect, createContext } from "react";
import { WebsocketContext } from "./utils/WebSocketProvider";
import { WebsocketProvider } from "./utils/WebSocketProvider";
import { LanguageContext } from "./utils/LanguageProvider";
import Toggle from "./components/Toggle";
import { useLocation } from "react-router-dom";
import { BrowserView, MobileView } from "react-device-detect";
import WatingMusicSrc from "../src/assets/bgm/Melody_of_travel_fluttering_ver..mp3";
import GameMusicSrc from "../src/assets/bgm/Melody_of_tongtong.mp3";
import PrivateRoute from "./utils/PrivateRoute";
import { Navigate } from "react-router-dom";
const Background = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #524fa1 0%, #3b36cf 100%);
`;

function App() {
  //언어 모드
  const [mode, setMode] = useState(0);
  const { pathname } = useLocation();

  const params = pathname.split("/");

  const [inGame, setInGame] = useState(false);

  useEffect(() => {
    if (isNaN(params[2]) === false) {
      setInGame(true);
    } else {
      setInGame(false);
    }
  });

  return (
    <WebsocketProvider>
      <LanguageContext.Provider value={mode}>
        <audio
          src={WatingMusicSrc}
          autoPlay={true}
          loop={true}
          muted={inGame}
        ></audio>
        <audio
          src={GameMusicSrc}
          autoPlay={true}
          loop={true}
          muted={!inGame}
        ></audio>
        <BrowserView>
          <Background>
            {pathname == "/" && <Toggle mode={mode} setMode={setMode} />}
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path={"*"} component={<Navigate to="/" />} />
              <Route element={<PrivateRoute />}>
                <Route path="/rooms" element={<RoomListPage />} />
                <Route path="/rooms/:room_id/*" element={<GameRoomPage />} />
                <Route path={"*"} component={<Navigate to="/" />} />
              </Route>
            </Routes>
          </Background>
        </BrowserView>
        <MobileView>
          <Background>
            {pathname == "/" && <Toggle mode={mode} setMode={setMode} />}

            <Routes>
              <Route path="/" element={<MobileLandingScreen />} />
              <Route
                path="/rooms/:room_id/*"
                element={<MobileGameRoomScreen />}
              />

              <Route path="/rooms" element={<MobileRoomListScreen />} />
            </Routes>
          </Background>
        </MobileView>
      </LanguageContext.Provider>
    </WebsocketProvider>
  );
}

export default App;
