import React, { useEffect, useState, useContext } from "react";
import ClockSrc from "../../assets/images/clock.png";
import { Medium, GradientText } from "../../styles/font";
import SvgIcon from "../common/SvgIcon";
import BgBox from "../common/BgBox";
import styled from "styled-components";
import GoldSrc from "../../assets/images/1st.svg";
import SilverSrc from "../../assets/images/2nd.svg";
import BronzeSrc from "../../assets/images/3rd.svg";
import SizedBox from "../common/SizedBox";
import { getUserName, getUserAffiliation } from "../../utils/User";
import { Language } from "../../db/Language";
import { LanguageContext } from "../../utils/LanguageProvider";
import { useMediaQuery } from "react-responsive";
import palette from "../../styles/palette";

export default function ResultBoard({ result }) {
  const mode = useContext(LanguageContext);
  const [myPlace, setMyPlace] = useState({
    name: "이름",
    team: 0,
    rank: 0,
    score: 0,
  });
  const my_name = getUserName();

  const _findMyPlace = () => {
    for (var place of result) {
      if (place.name === my_name) {
        //이름이 같으면
        return place;
      }
    }
    return {
      name: "이름",
      team: 0,
      rank: 0,
      score: 0,
    };
  };

  useEffect(() => {
    setMyPlace(_findMyPlace());
  }, []);
  const team_color = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "navy",
    "purple",
  ];

  const isMobile = useMediaQuery({ query: "(max-width:768px)" });
  return (
    <BgBox
      width={isMobile ? "100%" : "30%"}
      height={isMobile ? "70%" : "90%"}
      bgColor={"var(--light-purple)"}
    >
      <Col>
        <Title>
          <SvgIcon src={ClockSrc} size="50px" />
          <Medium color={"var(--mint)"}>{Language[mode].time_over}</Medium>
        </Title>
        <SizedBox height={10} />
        <BgBox width="90%" height="10%" bgColor={"white"}>
          <Center>
            <Place
              rank={myPlace?.rank}
              belong={team_color[myPlace?.team]}
              name={myPlace?.name}
              score={myPlace?.score}
            />
          </Center>
        </BgBox>

        <ScrollView>
          {result.map(({ team, rank, name, score }, idx) => (
            <Place
              key={idx}
              rank={rank}
              belong={team === -1 ? "bot" : team_color[team]}
              name={name}
              score={score}
            />
          ))}
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
        <GradientText size="30px" bg={palette[belong]}>
          {belong}
        </GradientText>
        <Medium size={"30px"} color="black"></Medium>
      </Sector>
      <Sector>
        <Medium size={"15px"} color="black">
          {name}
        </Medium>
      </Sector>
      <Sector>
        <Medium color="var(--mint)" size={"30px"}>
          {score >= 0 ? "+" + score : score}
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
  background: linear-gradient(180deg, #3ab6bc 0%, #3a66bc 100%, #2f508e 100%);
`;

const Title = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 20px;
  position: absolute;
  top: -7%;
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
