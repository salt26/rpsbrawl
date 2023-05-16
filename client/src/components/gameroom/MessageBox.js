import React from "react";
import BgBox from "../common/BgBox";
import { Medium } from "../../styles/font";
import styled from "styled-components";
function MessageBox({ children }) {
  return (
    <MsgBox>
      <Medium size="30px" color="red">
        {children}
      </Medium>
    </MsgBox>
  );
}

const MsgBox = styled.div`
  position: absolute;
  z-index: 101;
  top: 15%;
  left: 40%;
`;

export default MessageBox;
