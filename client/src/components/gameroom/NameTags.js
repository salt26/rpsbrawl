import React from "react";
import BgBox from "../common/BgBox";
import { Medium } from "../../styles/font";
import styled from "styled-components";
//일반 네임택
function NameTag({ children }) {
  return (
    <BgBox width="150px" height="50px">
      <Center>
        <Medium size="40px">{children}</Medium>
      </Center>
    </BgBox>
  );
}

//유저 네임택
function MyNameTag({ children }) {
  return (
    <BgBox width="150px" height="50px" bgColor="var(--yellow)">
      <Center>
        <Medium size="40px" color={"white"}>
          {children}
        </Medium>
      </Center>
    </BgBox>
  );
}

//스태프(방장) 네임택
function AdminTag({ children }) {
  return (
    <BorderBox width="150px" height="50px" color="var(--yellow)">
      <Center>
        <Medium size="40px">{children}</Medium>
      </Center>
    </BorderBox>
  );
}

const Center = styled.div`
  display: flex;
  flex-direction: center;

  justify-content: center;
  align-items: center;
`;

const BorderBox = styled.div`
  width: ${({ width }) => (width ? width : "120px")};
  height: ${({ height }) => (height ? height : "120px")};
  position: relative;
  background-color: ${({ bgColor }) => (bgColor ? bgColor : "white")};
  border-radius: 10px;
  border: 4px solid var(--yellow);
`;
export { NameTag, MyNameTag, AdminTag };
