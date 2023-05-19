import React from "react";
import SvgIcon from "./common/SvgIcon";
import GithubSrc from "../assets/images/github-mark.svg";
import styled from "styled-components";
function Github() {
  return (
    <IconContainer>
      <SvgIcon
        src={GithubSrc}
        size="40px"
        onClick={() => window.open("https://github.com/salt26/rpsbrawl")}
      />
    </IconContainer>
  );
}

const IconContainer = styled.a`
  border-radius: 50px;
  width: 30px;
  height: 40px;
  background-color: white;
  position: absolute;
`;

export default Github;
