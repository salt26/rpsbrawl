import React from "react";
import { Medium, GradientText } from "../../styles/font";
import styled from "styled-components";
import CrownSrc from "../../assets/images/crown.png";
import NewCrownSrc from "../../assets/images/crown_new.png";
import palette from "../../styles/palette";

//일반 네임택 -> 외곽선 그라데이션 O
function NameTag({ color, children }) {
  return (
    <BorderBox
      width="130px"
      height="50px"
      borderColor={color}
      bg={palette[color]}
    >
      <Center>
        <GradientText
          size={String(30 - 6 * (children.length / 7)) + "px"}
          bg={palette[color]}
        >
          {children}
        </GradientText>
      </Center>
    </BorderBox>
  );
}

//스태프(방장) 네임택
function AdminTag({ children, color, isMe }) {
  if (isMe) {
    return (
      <Container bg={palette[color]}>
        {color === "yellow" || color === "orange" ? (
          <Image src={NewCrownSrc} />
        ) : (
          <Image src={CrownSrc} />
        )}

        <Center>
          <Medium
            size={String(30 - 6 * (children.length / 7)) + "px"}
            color="white"
          >
            {children}
          </Medium>
        </Center>
      </Container>
    );
  } else {
    return (
      <BorderBox
        width="130px"
        height="50px"
        borderColor={color}
        bg={palette[color]}
      >
        <Image src={CrownSrc} />
        <Center>
          <GradientText
            size={String(30 - 6 * (children.length / 7)) + "px"}
            bg={palette[color]}
          >
            {children}
          </GradientText>
        </Center>
      </BorderBox>
    );
  }
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  box-sizing: border-box;

  width: 130px;
  height: 50px;

  background-image: ${({ bg }) =>
    bg ? bg : "linear-gradient(180deg, #fac215 0%, #f97916 100%);"};

  border-radius: 10px;
`;
const Center = styled.div`
  display: flex;
  flex-direction: center;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const Image = styled.img`
  width: 40px;
  height: 40px;
  position: absolute;
  transform: rotate(-45deg);
  top: -45%;
  left: -16%;
`;
const BorderBox = styled.div`
  width: ${({ width }) => (width ? width : "120px")};
  height: ${({ height }) => (height ? height : "50px")};
  position: relative;
  background-color: ${({ bgColor }) => (bgColor ? bgColor : "white")};
  border-radius: 10px;
  border: 4px solid;
  border-color: ${({ borderColor }) => (borderColor ? borderColor : "white")};

  border: 3px solid transparent;
  background-image: ${({ bg }) =>
    bg ? `linear-gradient(#fff, #fff), ${bg}` : "none"};

  background-origin: border-box;
  background-clip: content-box, border-box;
`;

export { NameTag, AdminTag };
