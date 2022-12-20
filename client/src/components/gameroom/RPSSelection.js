import React, { useState } from "react";
import styled from "styled-components";
import RockSrc from "../../assets/images/rock.png";
import ScissorSrc from "../../assets/images/scissor.png";
import PaperSrc from "../../assets/images/paper.png";

export default function RPSSelection({ last }) {
  var rpsDic = { 0: RockSrc, 1: ScissorSrc, 2: PaperSrc };

  return (
    <>
      <img src={rpsDic[last]} width="500px" />
      <Row>
        <ImgBox>
          <img src={RockSrc} width="100px" />
        </ImgBox>

        <ImgBox>
          <img src={ScissorSrc} width="100px" />
        </ImgBox>
        <ImgBox>
          {" "}
          <img src={PaperSrc} width="100px" />
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
