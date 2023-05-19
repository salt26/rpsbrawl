import React from "react";
import { NameTag, AdminTag } from "./NameTags";
import styled from "styled-components";
import { getUserName } from "../../utils/User";
import MyNameTag from "../common/MyNameTag";

export default function UserList({ users }) {
  const my_name = getUserName();

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
                <AdminTag
                  key={idx}
                  color={team_color[team]}
                  isMe={name === my_name}
                >
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
  align-self: flex-start;
  padding: 20px;
  gap: 30px 15px;

  overflow-x: hidden;
  overflow-y: scroll;
`;
