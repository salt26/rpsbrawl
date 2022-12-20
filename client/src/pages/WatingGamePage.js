import React from "react";
import { Route, Routes } from "react-router-dom";
import { Medium } from "../styles/font";
import styled from "styled-components";
import BgBox from "../components/common/BgBox";
import Button from "../components/common/Button";
import SizedBox from "../components/common/SizedBox";
import UserList from "../components/gameroom/UserList";
import { useNavigate } from "react-router-dom";

export default function WatingGamePage() {
  var number_of_user = 1;
  var navigate = useNavigate();

  const _quitGame = () => {
    navigate("/");
  };
  return (
    <Container>
      <Medium color="white" size={"60px"}>
        무엇을 낼지 고민하는 중..
      </Medium>
      <Medium color="white" size={"30px"}>
        난투가 곧 시작됩니다! (현재 {number_of_user}명)
      </Medium>
      <Row>
        <Button text="나가기" onClick={_quitGame} />
        <SizedBox width={"50px"} />

        <BgBox bgColor={"var(--light-purple)"} width="1000px" height="500px">
          <UserList />
        </BgBox>
      </Row>
    </Container>
  );
}
const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 30px;
  justify-content: space-around;
  align-items: center;
`;

const Row = styled.div`
  display: flex;

  width: 100%;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  margin-left: -150px;
`;
