import React, { useEffect, useState, useCallback, useRef } from "react";
import styled, { css } from "styled-components";
import RockSrc from "../../assets/images/rock.png";
import ScissorSrc from "../../assets/images/scissor.png";
import PaperSrc from "../../assets/images/paper.png";
import HTTP from "../../utils/HTTP";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { WebsocketContext } from "../../utils/WebSocketProvider";
import useInterval from "../../utils/useInterval";
import { COOL_TIME } from "../../Config";
import { GradientText } from "../../styles/font";

function RPSSelection({ lastHand, lastScore, flag }) {
  var rpsDic = { 0: RockSrc, 1: ScissorSrc, 2: PaperSrc };

  const { room_id } = useParams();

  const [coolTime, setCoolTime] = useState(false);
  const [showTime, setShowTime] = useState(false);
  // 4개의 단계 스테이지 16개의 맵

  const [createSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 불러오기

  // 점수 획득 -> 마지막점수
  const _addHand = useCallback((hand) => {
    let request = {
      request: "hand",
      hand: hand, // 0(Rock) 또는 1(Scissor) 또는 2(Paper)
    };
    ws.send(JSON.stringify(request));

    setCoolTime(true);
  }, []);
  useEffect(() => {
    if (coolTime && !showTime) {
      setShowTime(true);
    }
  }, [flag]); // 새로운 점수 정보가 도착하면

  useEffect(() => {
    const id = setTimeout(() => {
      setShowTime(false); //스코어 내리기
      setCoolTime(false); //쿨타임해제
    }, COOL_TIME * 1000);

    return () => clearInterval(id);
  }, [coolTime, showTime]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <TextContainer showTime={showTime}>
        {lastScore >= 0 ? (
          <GradientText
            bg={
              "linear-gradient(180deg, #3AB6BC 0%, #3A66BC 100%, #2F508E 100%);"
            }
            size="80px"
          >
            +{lastScore}
          </GradientText>
        ) : (
          <GradientText
            bg={"linear-gradient(180deg, #FA1515 0%, #F97916 100%);"}
            size="80px"
          >
            {lastScore}
          </GradientText>
        )}
      </TextContainer>
      <img src={rpsDic[lastHand]} width="80%" height={"auto"} />
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
    </div>
  );
}
// 같은 lastHand 값이 들어오면 재렌더링 진행하지 않기
function areEqual(prevProps, nextProps) {
  return prevProps === nextProps;
}

export default React.memo(RPSSelection, areEqual);

const TextContainer = styled.text`
  position: absolute;

  ${({ showTime }) => {
    if (showTime) {
      css`
        display: block;
      `;
    } else {
      // showTime이 지나면

      return css`
        display: none;
      `;
    }
  }}

  @media (max-width: 767px) {
    //모바일
    top: 30%;
    left: 50%;
  }

  @media (min-width: 1200px) {
    // 데스크탑 일반
    top: 80%;
    left: 45%;
  }
`;

const Row = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-around;

  width: 80%;

  align-items: center;

  z-index: 10;
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
