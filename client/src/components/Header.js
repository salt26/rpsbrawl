import React, { useEffect, useLocation, useState, useRef } from "react";
import styled from "styled-components";
import GameMusicSrc from "../assets/bgm/Melody_of_tongtong.mp3";
import MusicOnSrc from "../assets/images/music_on.png";
import MusicOffSrc from "../assets/images/music_off.png";
import Github from "../components/Github";
import WatingMusicSrc from "../assets/bgm/Melody_of_tongtong.mp3";
import TutorialBtn from "../components/common/TutorialBtn";
import TutorialModal from "../components/common/TutorialModal";
import Toggle from "./Toggle";

const Header = () => {
  const savedMode = Number(localStorage.getItem("language_mode"));
  const [mode, setMode] = useState(savedMode === null ? 0 : savedMode);
  // const { pathname } = useLocation();

  // const params = pathname.split("/");

  const [inGame, setInGame] = useState(false);
  const [audioAllowed, setAudioAllowed] = useState(false);
  const [tutorialModalVisible, setTutorialModalVisible] = useState(false);

  /*
  useEffect(() => {
    if (params[3] === "game" || params[3] === "result") {
      setInGame(true);
    } else {
      setInGame(false);
    }
  });
  */

  const inGameAudio = useRef(null);
  const basicAudio = useRef(null);

  const onPlayMusic = () => {
    setAudioAllowed(true);

    basicAudio.current.play();
  };

  const onPauseMusic = () => {
    setAudioAllowed(false);

    basicAudio.current.pause();
  };

  return (
    <HeaderBox>
      <Row>
        <Github />

        <Toggle mode={mode} setMode={setMode} />
      </Row>

      <Row>
        <TutorialBtn
          setTutorialModalVisible={setTutorialModalVisible}
          tutorialModalVisible={tutorialModalVisible}
        />

        <TutorialModal
          modalVisible={tutorialModalVisible}
          setModalVisible={setTutorialModalVisible}
        />
        {audioAllowed ? (
          <Icon src={MusicOnSrc} onClick={onPauseMusic} />
        ) : (
          <Icon src={MusicOffSrc} onClick={onPlayMusic} />
        )}
      </Row>
    </HeaderBox>
  );
};

const HeaderBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background-color: red;
`;

const Icon = styled.img`
  width: 40px;
  height: 40px;
`;

const Row = styled.div`
  display: flex;

  justify-content: space-between;
  gap: 20px;
`;
const GithubBox = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  padding-right: 3%;
  flex-direction: row;
  justify-content: flex-end;
`;

const ToggleContainer = styled.div``;
export default Header;
