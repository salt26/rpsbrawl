import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import RockSrc from "../../assets/images/rock.png";
import ScissorSrc from "../../assets/images/scissor.png";
import PaperSrc from "../../assets/images/paper.png";
import HTTP from "../../utils/HTTP";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { WebsocketContext } from "../../utils/WebSocketProvider";
import useInterval from "../../utils/useInterval";

export default function RPSSelection({ lastHand }) {
  var rpsDic = { 0: RockSrc, 1: ScissorSrc, 2: PaperSrc };

  const COOL_TIME = 3;
  const { room_id } = useParams();

  const [coolTime, setCoolTime] = useState(false);

  const [createSocketConnection, ready, res, send] =
    useContext(WebsocketContext); //전역 소켓 불러오기

  const _addHand = (hand) => {
    console.log("snd");

    let request = {
      request: "hand",
      hand: hand, // 0(Rock) 또는 1(Scissor) 또는 2(Paper)
    };
    send(JSON.stringify(request));

    setCoolTime(true);
  };

  console.log(coolTime);
  useEffect(() => {
    const id = setTimeout(() => {
      setCoolTime(false); //쿨타임해제
    }, COOL_TIME * 1000);

    return () => clearInterval(id);
  }, [coolTime]);

  return (
    <>
      <img src={rpsDic[lastHand]} width="500px" />
      <Row>
        <ImgBox coolTime={coolTime}>
          <img
            src={RockSrc}
            width="100px"
            onClick={() => {
              if (!coolTime) _addHand(0);
            }}
          />
        </ImgBox>

        <ImgBox coolTime={coolTime}>
          <img
            src={ScissorSrc}
            width="100px"
            onClick={() => {
              if (!coolTime) _addHand(1);
            }}
          />
        </ImgBox>
        <ImgBox coolTime={coolTime}>
          {" "}
          <img
            src={PaperSrc}
            width="100px"
            onClick={() => {
              if (!coolTime) _addHand(2);
            }}
          />
        </ImgBox>
      </Row>
    </>
  );
}

const Wrapper = styled.div`
  z-index: 3;
  ${({ isWaiting }) =>
    isWaiting &&
    css`
      filter: alpha(opacity=40);
      opacity: 0.4;
      -moz-opacity: 0.4;
      background: rgba(217, 217, 217, 72) repeat;
    `}
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;

  width: 50%;
  align-items: center;

  z-index: 10000;
`;

const ImgBox = styled.div`
  border-radius: 10%;
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ coolTime }) => {
    if (coolTime) {
      // 쿨타임이 있으면
      css`
        filter: alpha(opacity=40);
        opacity: 0.4;
        -moz-opacity: 0.4;
        background: rgba(217, 217, 217, 72) repeat;
        pointer-events: "none";
        cursor: none;
      `;
    } else {
      //쿨타임이 없으면
      return css`
        &:hover {
          background-color: var(--light-purple);
        }
        cursor: pointer;
      `;
    }
  }}
`;
