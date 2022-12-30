import {
  GameResultPage,
  InGamePage,
  LandingPage,
  WatingGamePage,
  GameRoomPage,
} from "./pages";
import { Route, Routes } from "react-router-dom";
import { BASE_WEBSOCKET_URL } from "./Config";
import styled from "styled-components";
import "./App.css";
import { useState, useRef, useEffect, createContext } from "react";
import { WebsocketContext } from "./utils/WebSocketProvider";
import { WebsocketProvider } from "./utils/WebSocketProvider";
const Background = styled.div`
  width: 100%;
  height: 100vh;
  background-color: var(--background);
`;

function App() {
  return (
    <WebsocketProvider>
      <Background>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/room/:room_id/*" element={<GameRoomPage />} />
        </Routes>
      </Background>
    </WebsocketProvider>
  );
}

export default App;
