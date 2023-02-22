import styled from "styled-components";

export const Medium = styled.text`
  font-family: "KOTRAHOPE";
  font-size: ${({ size }) => (size ? size : "50px")};
  color: ${({ color }) => (color ? color : "black")};
  text-shadow: ${({ shadow }) =>
    shadow ? " 0px 5.17647px 5.17647px rgba(0, 0, 0, 0.25);" : "none"};
`;

export const GradientText = styled.text`
  font-family: "KOTRAHOPE";
  font-size: ${({ size }) => (size ? size : "50px")};
  background: ${({ bg }) => (bg ? bg : "none")};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;
export const NavyGradient = styled.text`
  font-family: "KOTRAHOPE";
  font-size: ${({ size }) => (size ? size : "50px")};
  color: ${({ color }) => (color ? color : "black")};
  background: linear-gradient(180deg, #3ab6bc 0%, #3a66bc 100%, #2f508e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;
export const RedGradient = styled.text`
  font-family: "KOTRAHOPE";
  font-size: ${({ size }) => (size ? size : "50px")};
  color: ${({ color }) => (color ? color : "black")};
  background: linear-gradient(180deg, #3ab6bc 0%, #3a66bc 100%, #2f508e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const MediumOutline = styled.text`
  font-family: "KOTRAHOPE";
  font-size: ${({ size }) => (size ? size : "50px")};
  color: ${({ color }) => (color ? color : "black")};
  -webkit-text-stroke: 1px white;
  font-weight: 400;
  line-height: 50px;
  text-align: center;
  flex-direction: row;
  display: flex;

  text-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25);
`;
