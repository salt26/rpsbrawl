import React, { useState, useEffect } from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import styled from "styled-components";
import Clock from "./Clock";
import SizedBox from "../common/SizedBox";
import ClockSrc from "../../assets/images/clock.png";
import SvgIcon from "../common/SvgIcon";
import useInterval from "../../utils/useInterval";
import { Medium } from "../../styles/font";
export default function TimeBar() {
  const [sec, setSec] = useState(5);
  const [isRunning, setIsRunning] = useState(true);
  useInterval(
    () => {
      setSec(sec - 1);
      console.log(sec);
      if (sec == 1) {
        setIsRunning(false);
      }
    },
    isRunning ? 1000 : null
  );

  return (
    <Row>
      <SvgIcon src={ClockSrc} size="100px" />
      <SizedBox width={"50px"} />
      <ProgressBar
        completed={String(sec)}
        bgColor="var(--yellow)"
        width="500px"
        height="40px"
      />
      <SizedBox width={"10px"} />
      <Medium color="white" size={"25px"}>
        {sec}
      </Medium>
    </Row>
  );
}
const Row = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;
