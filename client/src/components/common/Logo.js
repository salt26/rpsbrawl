import React from "react";
import styled from "styled-components";
import { Medium } from "../../styles/font";
import LogoSrc from "../../assets/images/logo_small.png";
import SvgIcon from "./SvgIcon";
import { useMediaQuery } from "react-responsive";

export default function Logo({ size }) {
  const isMobile = useMediaQuery({ query: "(max-width:768px)" });
  const sizes = {
    m: isMobile ? "120%" : "550px",
    s: isMobile ? "50%" : "300px",
  };
  return <SvgIcon src={LogoSrc} width={sizes[size]} height={"auto"} />;
}
