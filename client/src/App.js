import {
  GameResultPage,
  InGamePage,
  LandingPage,
  WatingGamePage,
  GameRoomPage,
  RoomListPage,
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
import WatingMusicSrc from "../src/assets/bgm/Melody_of_travel_fluttering_ver..mp3";
import GameMusic from "../src/assets/bgm/Melody_of_tongtong.mp3";
const Background = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #524fa1 0%, #3b36cf 100%);
`;

function App() {
  //언어 모드
  const [mode, setMode] = useState(0);
  const { pathname } = useLocation();

  console.log(pathname);
  const isInGame = () => {
    if (pathname == "/" || pathname == "/rooms") return false;
    else return true;
  };
  return (
    <WebsocketProvider>
      <LanguageContext.Provider value={mode}>
        <Background>
          {pathname == "/" && <Toggle mode={mode} setMode={setMode} />}

          {isInGame || (
            <audio src={WatingMusicSrc} autoPlay={true} loop={true}></audio>
          )}

          {isInGame && (
            <audio src={GameMusic} autoPlay={true} loop={true}></audio>
          )}

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/rooms/:room_id/*" element={<GameRoomPage />} />

            <Route path="/rooms" element={<RoomListPage />} />
          </Routes>
        </Background>
      </LanguageContext.Provider>
    </WebsocketProvider>
  );
}

export default App;
