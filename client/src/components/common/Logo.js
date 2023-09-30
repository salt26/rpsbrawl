import React from "react";
import styled from "styled-components";
import { Medium } from "../../styles/font";
import LogoSrc from "../../assets/images/logo_small.png";
import SvgIcon from "./SvgIcon";
import { useMediaQuery } from "react-responsive";

export default function Logo({ size }) {
  const sizes = {
    m: "550px",
    s: "300px",
  };
  return <SvgIcon src={LogoSrc} width={sizes[size]} height={"auto"} />;
}
