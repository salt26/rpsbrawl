import React from "react";
import { Route, Routes } from "react-router-dom";
import { Medium } from "../styles/font";
import styled from "styled-components";
import BgBox from "../components/common/BgBox";
import Button from "../components/common/Button";
import WatingGamePage from "./WatingGamePage";
import InGamePage from "./InGamePage";
import GameResultPage from "./GameResultPage";
/**
 * [라우팅 규칙]
 *
 * /room/{id}/wating : 대기룸
 * /room/{id}/game : 게임중
 * /room/{id}/result : 결과창
 *
 */
export default function GameRoomPage() {
  return (
    <>
      <Routes>
        <Route path="/waiting" element={<WatingGamePage />} />
        <Route path="/game" element={<InGamePage />} />
        <Route path="/result" element={<GameResultPage />} />
      </Routes>
    </>
  );
}
