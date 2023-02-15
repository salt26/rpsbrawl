import React from "react";
import { NameTag, AdminTag } from "./NameTags";
import styled from "styled-components";
import { getUserName } from "../../utils/User";
import MyNameTag from "../common/MyNameTag";

export default function UserList({ users }) {
  const my_name = getUserName();
  return (
    <Container>
      {users.map(({ affiliation, name }, idx) => {
        if (name === my_name) {
          return (
            <Anim>
              <MyNameTag key={idx} size="s" name={name}>
                {name}
              </MyNameTag>
            </Anim>
          );
        } else if (affiliation === "STAFF") {
          return <AdminTag key={idx}>{name}</AdminTag>;
        } else {
          return <NameTag key={idx}>{name}</NameTag>;
        }
      })}
      <Anim>
        <MyNameTag size="s" none>
          김서연
        </MyNameTag>
      </Anim>

      <AdminTag>김서연</AdminTag>
      <NameTag color="red">{"YEONLEAF"}</NameTag>
      <NameTag color="orange">{"YEONLEAF"}</NameTag>
      <NameTag color="green">{"YEONLEAF"}</NameTag>
      <NameTag color="navy">{"YEONLEAF"}</NameTag>
      <NameTag color="red">{"YEONLEAF"}</NameTag>
      <NameTag color="orange">{"YEONLEAF"}</NameTag>
      <NameTag color="green">{"YEONLEAF"}</NameTag>
      <NameTag color="navy">{"YEONLEAF"}</NameTag>
      <NameTag color="red">{"YEONLEAF"}</NameTag>
      <NameTag color="orange">{"YEONLEAF"}</NameTag>
      <NameTag color="green">{"YEONLEAF"}</NameTag>
      <NameTag color="navy">{"YEONLEAF"}</NameTag>
      <NameTag color="red">{"YEONLEAF"}</NameTag>
      <NameTag color="orange">{"YEONLEAF"}</NameTag>
      <NameTag color="green">{"YEONLEAF"}</NameTag>
      <NameTag color="navy">{"YEONLEAF"}</NameTag>
      <NameTag color="navy">{"YEONLEAF"}</NameTag>
      <NameTag color="red">{"YEONLEAF"}</NameTag>
      <NameTag color="orange">{"YEONLEAF"}</NameTag>
      <NameTag color="green">{"YEONLEAF"}</NameTag>
      <NameTag color="navy">{"YEONLEAF"}</NameTag>
      <NameTag color="navy">{"YEONLEAF"}</NameTag>
      <NameTag color="red">{"YEONLEAF"}</NameTag>
      <NameTag color="orange">{"YEONLEAF"}</NameTag>
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
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;

  padding: 30px;
  margin-right: 10px;
  gap: 40px 25px;
  height: 100%;

  overflow-x: hidden;
  overflow-y: scroll;
`;
