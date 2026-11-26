import React, { useEffect, useState, useCallback, useRef } from "react";
import styled, { css } from "styled-components";
import RockSrc from "../../assets/images/rock.png";
import ScissorSrc from "../../assets/images/scissor.png";
import PaperSrc from "../../assets/images/paper.png";

import { useParams } from "react-router-dom";
import { useContext } from "react";
import { WebsocketContext } from "../../utils/WebSocketProvider";
import useInterval from "../../utils/useInterval";
import { COOL_TIME } from "../../Constants";
import { GradientText } from "../../styles/font";
import { isMobile } from "react-device-detect";

function RPSSelection({ lastHand, rejectCount }) {
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
    const id = setTimeout(() => {
      setCoolTime(false); //쿨타임해제
    }, COOL_TIME * 1000);

    return () => clearInterval(id);
  }, [coolTime]);

  // 한 손 제한에 걸려 서버가 받지 않은 손은 쿨타임 없이 바로 다시 낼 수 있게
  useEffect(() => {
    if (rejectCount) setCoolTime(false);
  }, [rejectCount]);

  // 길게 눌렀을 때 컨텍스트 메뉴·드래그·선택이 일어나지 않게
  const noMenu = {
    draggable: false,
    onContextMenu: (e) => e.preventDefault(),
  };

  const selectImgStyle = {
    height: isMobile ? "10vh" : "100px",
    WebkitTouchCallout: "none",
    WebkitUserSelect: "none",
    userSelect: "none",
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxHeight: isMobile ? "40vh" : "auto",
        width: "100%",
      }}
    >
      <img
        src={rpsDic[lastHand]}
        {...noMenu}
        style={{
          height: isMobile ? "30vh" : "auto",
          width: isMobile ? "auto" : "50%",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
      />
      <Row>
        <ImgBox coolTime={coolTime}>
          <img
            src={RockSrc}
            {...noMenu}
            style={selectImgStyle}
            onClick={() => {
              if (!coolTime) _addHand(0);
            }}
          />
        </ImgBox>

        <ImgBox coolTime={coolTime}>
          <img
            src={ScissorSrc}
            {...noMenu}
            style={selectImgStyle}
            onClick={() => {
              if (!coolTime) _addHand(1);
            }}
          />
        </ImgBox>
        <ImgBox coolTime={coolTime}>
          {" "}
          <img
            src={PaperSrc}
            {...noMenu}
            style={selectImgStyle}
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

const Row = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 5vw;

  width: 100%;
  align-items: center;

  z-index: 3;
`;

const ImgBox = styled.div`
  border-radius: 10%;
  display: flex;
  justify-content: center;
  align-items: center;

  transition: filter 0.15s;

  ${({ coolTime }) => {
    if (coolTime) {
      // 쿨타임이 있으면 살짝 어둡게, 누를 수 없게
      return css`
        filter: brightness(0.6);
        pointer-events: none;
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
