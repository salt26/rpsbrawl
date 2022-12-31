import React, { useState } from "react";
import styled from "styled-components";
import RockSrc from "../../assets/images/rock.png";
import ScissorSrc from "../../assets/images/scissor.png";
import PaperSrc from "../../assets/images/paper.png";
import HTTP from "../../utils/HTTP";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { WebsocketContext } from "../../utils/WebSocketProvider";
export default function RPSSelection({ last }) {
  var rpsDic = { 0: RockSrc, 1: ScissorSrc, 2: PaperSrc };

  const { room_id } = useParams();

  const [lastRPS, setLastRPS] = useState(last);
  const [createSocketConnection, ready, res, send] =
    useContext(WebsocketContext); //전역 소켓 불러오기
  const person_id = sessionStorage.getItem("person_id");

  const _addHand = (hand) => {
    let request = {
      request: "hand",
      hand: hand, // 0(Rock) 또는 1(Scissor) 또는 2(Paper)
    };
    send(JSON.stringify(request));
  };
  return (
    <>
      <img src={rpsDic[last]} width="500px" />
      <Row>
        <ImgBox>
          <img src={RockSrc} width="100px" onClick={() => _addHand(0)} />
        </ImgBox>

        <ImgBox>
          <img src={ScissorSrc} width="100px" onClick={() => _addHand(1)} />
        </ImgBox>
        <ImgBox>
          {" "}
          <img src={PaperSrc} width="100px" onClick={() => _addHand(2)} />
        </ImgBox>
      </Row>
    </>
  );
}
const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;

  width: 50%;
  align-items: center;
`;

const ImgBox = styled.div`
  cursor: pointer;
  border-radius: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    background-color: var(--light-purple);
  }
`;
