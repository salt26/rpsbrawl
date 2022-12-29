import React from "react";
import { NameTag, AdminTag, MyNameTag } from "./NameTags";
import styled from "styled-components";

export default function UserList({ users }) {
  const my_name = sessionStorage.getItem("person_name");
  return (
    <Container>
      {users.map(({ affiliation, name }, idx) => {
        if (name === my_name) {
          return <MyNameTag key={idx}>{name}</MyNameTag>;
        } else if (affiliation === "STAFF") {
          return <AdminTag key={idx}>{name}</AdminTag>;
        } else {
          return <NameTag key={idx}>{name}</NameTag>;
        }
      })}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 30px;
  gap: 30px;
`;
