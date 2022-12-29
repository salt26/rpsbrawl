import React from "react";
import ClockSrc from "../../assets/images/clock.png";
import { Medium } from "../../styles/font";
import SvgIcon from "../common/SvgIcon";
import BgBox from "../common/BgBox";
import styled from "styled-components";
import GoldSrc from "../../assets/images/1st.svg";
import SilverSrc from "../../assets/images/2nd.svg";
import BronzeSrc from "../../assets/images/3rd.svg";
import SizedBox from "../common/SizedBox";

export default function ResultBoard() {
  return (
    <BgBox width="30%" height="90%" bgColor={"var(--light-purple)"}>
      <Col>
        <Title>
          <SvgIcon src={ClockSrc} size="80px" />
          <Medium color={"var(--mint)"}>시간종료</Medium>
        </Title>
        <SizedBox height={10} />
        <BgBox width="90%" height="10%" bgColor={"white"}>
          <Center>
            <Place rank={1} belong="King" name="김서연" score={100} />
          </Center>
        </BgBox>

        <ScrollView>
          <Place rank={1} belong="King" name="김서연" score={100} />
          <Place rank={2} belong="King" name="김서연" score={80} />
          <Place rank={3} belong="King" name="김서연" score={70} />
          <Place rank={4} belong="King" name="김서연" score={60} />
          <Place rank={4} belong="King" name="김서연" score={60} />
          <Place rank={4} belong="King" name="김서연" score={60} />
          <Place rank={4} belong="King" name="김서연" score={60} />
          <Place rank={4} belong="King" name="김서연" score={60} />
          <Place rank={4} belong="King" name="김서연" score={60} />
          <Place rank={4} belong="King" name="김서연" score={60} />
          <Place rank={4} belong="King" name="김서연" score={60} />
          <Place rank={4} belong="King" name="김서연" score={60} />
        </ScrollView>

        <SizedBox height={10} />
      </Col>
    </BgBox>
  );
}
const ScrollView = styled.div`
  width: 90%;
  height: 75%;
  background-color: white;
  border-radius: 10px;
  overflow-x: hidden;
  overflow-y: auto;
`;
function Place({ rank, belong, name, score }) {
  var img = <Rank rank={rank} />;

  if (rank === 1) {
    img = <SvgIcon src={GoldSrc} size="30px" />;
  } else if (rank === 2) {
    img = <SvgIcon src={SilverSrc} size="30px" />;
  } else if (rank === 3) {
    img = <SvgIcon src={BronzeSrc} size="30px" />;
  }

  return (
    <Row>
      {/*<SvgIcon src={GoldSrc} size="30px" />*/}
      <Sector>{img}</Sector>

      <Sector>
        <Medium size={"30px"} color="black">
          {belong}
        </Medium>
      </Sector>
      <Sector>
        <Medium size={"30px"} color="black">
          {name}
        </Medium>
      </Sector>
      <Sector>
        <Medium color="var(--mint)" size={"30px"}>
          + {score}
        </Medium>
      </Sector>
    </Row>
  );
}
function Rank({ rank }) {
  return (
    <Circle>
      <Medium color="white" size={"30px"}>
        {rank}
      </Medium>
    </Circle>
  );
}

const Circle = styled.div`
  border-radius: 100%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--mint);
`;

const Title = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 20px;
  position: absolute;
  top: -50px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  position: relative;
  width: 100%;
  height: 100%;
`;
const Center = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const Sector = styled.div`
  flex: 0.25;
  display: flex;
  justify-content: center;
  align-items: center;
`;
