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
import CancelIconSrc from "../../assets/images/cancel.svg";
import SvgIcon from "../common/SvgIcon";
function TeamSelection({ setTeamSelectionVisible }) {
  const teams = ["red", "orange", "yellow", "green", "blue", "navy", "purple"];
  const isMobile = useMediaQuery({ query: "(max-width:768px)" });

  const [createSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 불러오기
  const mode = useContext(LanguageContext);
  const _changeMyTeam = (team_idx) => {
    let request = {
      request: "team",
      team: team_idx, // 0 이상 7 이하
    };
    ws.send(JSON.stringify(request));
  };

  const _closeModal = () => {
    setTeamSelectionVisible(false);
  };

  return (
    <Box>
      <BgBox
        bgColor={isMobile ? "#BAB8F4" : "var(--light-purple)"}
        width="150px"
        height="400px"
      >
        <TextContainer>
          <MediumOutline color="#6E3D9D" size={"40px"}>
            {Language[mode].team}
          </MediumOutline>
        </TextContainer>
        {isMobile && (
          <RightTop>
            <SvgIcon src={CancelIconSrc} onClick={_closeModal} />
          </RightTop>
        )}

        <Col>
          {" "}
          {teams.map((team, idx) => (
            <TeamBtn
              key={idx}
              color={team}
              onClick={() => _changeMyTeam(idx)}
            />
          ))}
        </Col>
      </BgBox>
    </Box>
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
  top: -20px;
`;

const Box = styled.div`
  @media (max-width: 767px) {
    //모바일
    position: absolute;

    align-self: center;

    z-index: 5;
  }

  @media (min-width: 1200px) {
    // 데스크탑 일반
    position: relative;
  }
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

const RightTop = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  cursor: pointer;
`;
export default TeamSelection;
