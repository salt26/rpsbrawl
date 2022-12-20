import React from "react";
import ResultBoard from "../components/gameroom/ResultBoard";
import Button from "../components/common/Button";
import styled from "styled-components";

export default function GameResultPage() {
  return (
    <Row>
      <Button text="나가기" />
      <ResultBoard />
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
