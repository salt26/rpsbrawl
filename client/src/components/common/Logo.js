import React from "react";
import styled from "styled-components";
import { Medium } from "../../styles/font";
import LogoSrc from "../../assets/images/logo_small.png";
import SvgIcon from "./SvgIcon";

export default function Logo() {
  return <SvgIcon src={LogoSrc} width={"600px"} height={"250px"} />;
}
