import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Medium } from "../styles/font";
import styled from "styled-components";
import BgBox from "../components/common/BgBox";
import Button from "../components/common/Button";
import SizedBox from "../components/common/SizedBox";
import UserList from "../components/gameroom/UserList";
import { useNavigate } from "react-router-dom";
import HTTP from "../utils/HTTP";
import { useParams } from "react-router-dom";
import useInterval from "../utils/useInterval";
export default function WatingGamePage() {
  const { room_id } = useParams();

  const [numberOfUser, setNumberOfUser] = useState(1);
  const [users, setUsers] = useState([]);

  const isAuthorized = sessionStorage.getItem("affiliation") == "STAFF";

  const person_id = sessionStorage.getItem("person_id");
  var navigate = useNavigate();

  useEffect(() => {
    /*방정보 받아오기 */
    _fetchRoomInfo();
  }, []);

  const _fetchRoomInfo = () => {
    /*방 인원 정보 받아오기*/

    HTTP.get(`/room/${room_id}/game`)
      .then((res) => {
        if (res.status == 200) {
          setNumberOfUser(res.data.length);
          setUsers(res.data);
          console.log(res.data);
        } else {
          console.log(res.data.detail);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useInterval(_fetchRoomInfo, 1000);
  const _quitGame = () => {
    HTTP.delete(`/room/${room_id}?person_id=${person_id}`)
      .then((res) => {
        if (res.status == 200) {
          sessionStorage.removeItem("person_id");
          sessionStorage.removeItem("person_name");
          navigate("/");
        } else {
          alert(res.data.detail);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const _startGame = () => {};
  return (
    <Container>
      <Medium color="white" size={"60px"}>
        무엇을 낼지 고민하는 중..
      </Medium>
      <Medium color="white" size={"30px"}>
        난투가 곧 시작됩니다! (현재 {numberOfUser}명)
      </Medium>
      <Row>
        <Sector>
          <Button text="나가기" onClick={_quitGame} />
        </Sector>
        <SizedBox width={"50px"} />
        <Sector>
          <BgBox bgColor={"var(--light-purple)"} width="1000px" height="500px">
            <UserList users={users} />
          </BgBox>
        </Sector>
        <SizedBox width={"50px"} />
        <Sector>
          {isAuthorized ? (
            <Button text="시작" onClick={_startGame} bgColor="var(--red)" />
          ) : (
            <></>
          )}
        </Sector>
      </Row>
    </Container>
  );
}
const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 30px;
  justify-content: space-around;
  align-items: center;
`;

const Row = styled.div`
  display: flex;

  width: 100%;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
`;
const Sector = styled.div`
  flex: 0.3;
  display: flex;
  justify-content: center;
  align-items: center;
`;
