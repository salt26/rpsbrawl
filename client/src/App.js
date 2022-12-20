import {
  GameResultPage,
  InGamePage,
  LandingPage,
  WatingGamePage,
  GameRoomPage,
} from "./pages";
import { Route, Routes } from "react-router-dom";

import styled from "styled-components";
import "./App.css";
const Background = styled.div`
  width: 100%;
  height: 100vh;
  background-color: var(--background);
`;

function App() {
  return (
    <Background>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/room/:room_id/*" element={<GameRoomPage />} />
      </Routes>
    </Background>
  );
}

export default App;
