import React from "react";
import { NameTag, AdminTag, MyNameTag } from "./NameTags";
import styled from "styled-components";

export default function UserList({ users }) {
  return (
    <Container>
      <NameTag>김서연</NameTag>
      <NameTag>김서연</NameTag>
      <NameTag>김서연</NameTag>
      <NameTag>김서연</NameTag>
      <NameTag>김서연</NameTag>
      <NameTag>김서연</NameTag>
      <NameTag>김서연</NameTag>
      <AdminTag>방장</AdminTag>
      <MyNameTag>나자신</MyNameTag>
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
