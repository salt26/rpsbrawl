import React from "react";
import styled from "styled-components";
import RockSrc from "../../assets/images/rock.png";
import ScissorSrc from "../../assets/images/scissor.png";
import PaperSrc from "../../assets/images/paper.png";
export function Rock({ size }) {
  return <img src={RockSrc} width={size} height={size} />;
}

export function Paper({ size }) {
  return <img src={PaperSrc} width={size} height={size} />;
}

export function Scissor({ size }) {
  return <img src={ScissorSrc} width={size} height={size} />;
}
