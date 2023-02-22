import React from "react";
import { NameTag, AdminTag } from "./NameTags";
import styled from "styled-components";
import { getUserName } from "../../utils/User";
import MyNameTag from "../common/MyNameTag";

export default function UserList({ users }) {
  const my_name = getUserName();
  console.log(users);

  const team_color = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "navy",
    "purple",
  ];

  return (
    <Container>
      {users.map(({ team, name, is_host }, idx) => {
        if (is_host) {
          if (name === my_name) {
            return (
              <Anim>
                <AdminTag key={idx} color={team_color[team]}>
                  {name}
                </AdminTag>
              </Anim>
            );
          } else {
            return (
              <AdminTag key={idx} color={team_color[team]}>
                {name}
              </AdminTag>
            );
          }
        } else if (name === my_name) {
          return (
            <Anim>
              <MyNameTag key={idx} size="s" color={team_color[team]} none>
                {name}
              </MyNameTag>
            </Anim>
          );
        } else {
          return (
            <NameTag key={idx} color={team_color[team]}>
              {name}
            </NameTag>
          );
        }
      })}
    </Container>
  );
}
const Anim = styled.div`
  animation: ani 0.5s infinite alternate;
  @keyframes ani {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(0, -5px);
    }
  }
`;
const Container = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;

  @media (max-width: 767px) {
    //모바일
    padding: 20px;
    gap: 10px 10px;
  }

  @media (min-width: 1200px) {
    // 데스크탑 일반

    padding: 30px;
    gap: 40px 25px;
  }

  overflow-x: hidden;
  overflow-y: scroll;
`;
