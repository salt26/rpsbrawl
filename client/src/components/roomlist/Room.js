import React from "react";
import styled from "styled-components";
import { Medium } from "../../styles/font";
import LockSrc from "../../assets/images/lock.svg";
import SvgIcon from "../common/SvgIcon";
import GradientBtn from "./GradientBtn";
import { Language } from "../../db/Language";
import { LanguageContext } from "../../utils/LanguageProvider";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

function Room({ title, lock, person, state }) {
  var navigate = useNavigate();
  const mode = useContext(LanguageContext);
  const joinBtnStyle = {
    width: "70px",
    height: "30px",
    borderRadius: "50px",
    bg: "linear-gradient(180deg, #3AB6BC 0%, #3A66BC 100%, #2F508E 100%);",
  };

  const playBtnStyle = {
    width: "70px",
    height: "30px",
    borderRadius: "50px",
    bg: "linear-gradient(180deg, #FA1515 0%, #F97916 100%);",
  };

  const _enterRoom = (room_id) => {
    // 방 입장

    navigate(`./${room_id}/waiting`);
  };
  return (
    <Box>
      <Row>
        <Medium color="white" size="25px">
          Welcome
        </Medium>

        <SvgIcon src={LockSrc} size="20px" />
      </Row>
      <Row>
        <Medium color="white" size="20px">
          15/30
        </Medium>
        {state == 0 ? (
          <GradientBtn
            text={Language[mode].join}
            style={joinBtnStyle}
            onClick={() => _enterRoom(1)}
          />
        ) : (
          <GradientBtn
            text={Language[mode].play}
            style={playBtnStyle}
            disabled
          />
        )}
      </Row>
    </Box>
  );
}

const Box = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #7b78d5;
  border-radius: 10px;
  width: 45%;
  height: 25%;
  padding: 20px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
export default Room;
