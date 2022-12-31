import React from "react";
import ResultBoard from "../components/gameroom/ResultBoard";
import Button from "../components/common/Button";
import styled from "styled-components";
import HTTP from "../utils/HTTP";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserId } from "../utils/User";

export default function GameResultPage() {
  const { room_id } = useParams();
  const { state } = useLocation(); // 손 목록 정보, 게임 전적 정보
  const person_id = getUserId();
  const navigate = useNavigate();

  const _quitGame = () => {
    navigate("/");
  };
  return (
    <Row>
      <Button text="나가기" onClick={_quitGame} />
      <ResultBoard result={state} />
      <Button text="결과저장" />
    </Row>
  );
}
const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-end;
  padding-bottom: 50px;
  height: 100%;
`;
