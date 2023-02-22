import React from "react";
import BgBox from "../common/BgBox";
import styled from "styled-components";
import { MediumOutline } from "../../styles/font";
import palette from "../../styles/palette";
import { Medium } from "../../styles/font";
import { Language } from "../../db/Language";
import { LanguageContext } from "../../utils/LanguageProvider";
import { useContext } from "react";
import { WebsocketContext } from "../../utils/WebSocketProvider";
import { useMediaQuery } from "react-responsive";
function TeamSelection({}) {
  const teams = ["red", "orange", "yellow", "green", "blue", "navy", "purple"];
  const isMobile = useMediaQuery({ query: "(max-width:768px)" });

  console.log(isMobile);
  const [createSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 불러오기
  const mode = useContext(LanguageContext);
  const _changeMyTeam = (team_idx) => {
    let request = {
      request: "team",
      team: team_idx, // 0 이상 7 이하
    };
    ws.send(JSON.stringify(request));
  };

  return (
    <div style={{ display: isMobile ? "none" : "block" }}>
      <BgBox bgColor={"var(--light-purple)"} width="150px" height="400px">
        <TextContainer>
          <MediumOutline color="#6E3D9D" size={"40px"}>
            {Language[mode].team}
          </MediumOutline>
        </TextContainer>

        <Col>
          {" "}
          {teams.map((team, idx) => (
            <TeamBtn color={team} onClick={() => _changeMyTeam(idx)} />
          ))}
        </Col>
      </BgBox>
    </div>
  );
}
function TeamBtn({ color, onClick }) {
  return (
    <Container
      width="150px"
      height="50px"
      bg={palette[color]}
      onClick={onClick}
    >
      <Center>
        <Medium size="25px" color={"white"}>
          {color}
        </Medium>
      </Center>
    </Container>
  );
}
const Center = styled.div`
  display: flex;
  flex-direction: center;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  margin-top: 10px;
  justify-content: space-between;
`;
const TextContainer = styled.div`
  position: absolute;
  align-self: center;
  top: -8px;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-sizing: border-box;

  width: 100px;
  height: 30px;

  background: ${({ bg }) => (bg ? bg : "none")};
  border-radius: 10px;
  &:hover {
    transform: scale(1.1);
  }
`;
export default TeamSelection;
