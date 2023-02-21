import React from "react";
import BgBox from "../common/BgBox";
import { Medium } from "../../styles/font";
import styled from "styled-components";
function MessageBox({ children }) {
  return (
    <MsgBox>
      <div
        style={{
          backgroundColor: `white`,
          borderRadius: "10px",
          padding: "10px",
          width: "100%",
        }}
      >
        <Medium size="20px" color="red">
          {children}
        </Medium>
      </div>
    </MsgBox>
  );
}

const MsgBox = styled.div`
  position: absolute;
  z-index: 101;
  top: 10%;
  left: 40%;
`;

export default MessageBox;
