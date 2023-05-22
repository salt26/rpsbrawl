import { useState, useRef, useEffect } from "react";
import { createContext } from "react";
import { setUserId, setUserName } from "./User";
import { useNavigate } from "react-router-dom";
import { setIsLogin } from "./User";
import { Language } from "../db/Language";
import { LanguageContext } from "./LanguageProvider";
import { useContext } from "react";

export const WebsocketContext = createContext([
  () => {},
  false,
  null,
  () => {},
  "default",
]);

//                                            ready, value, send

// Make sure to put WebsocketProvider higher up in
// the component tree than any consumers.
export const WebsocketProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [res, setRes] = useState(null);

  const mode = useContext(LanguageContext);

  const navigate = useNavigate();
  const ws = useRef(null);
  const samePersonErr = useRef(false);
  // 웹소켓 연결

  function createWebSocketConnection(name, setIsLoading) {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem("access_token");

      const socket = new WebSocket(
        `${process.env.REACT_APP_RPS_BASE_WEBSOCKET_URL}/signin?name=${name}&token=${token}`
      );

      socket.onopen = (event) => {
        console.log("Socket open", event);
        setIsReady(true);
        resolve(socket);
      };

      socket.onclose = (event) => {
        console.log("onclose!", event);

        const currentPath = window.location.href.replace(
          window.location.origin,
          ""
        );

        // 방목록에서 <- 버튼 눌렀을때는 제외하구

        if (currentPath === "/rooms") {
          navigate("/");
          return;
        }
        setIsReady(false);

        if (samePersonErr) {
          samePersonErr.current = false;

          return;
        }

        alert(Language[mode].reconnection_request);
        navigate("/");
        reject();
      };

      socket.onmessage = function (event) {
        const res = JSON.parse(event.data);
        // 전달된 json string을 object로 변환

        if (res?.response === "error") {
          alert(res.message);
          if (
            res.message ===
            "The same person has already entered in non-end room."
          ) {
            samePersonErr.current = true;
          }
          return;
        }

        switch (res?.type) {
          case "profile_and_room_list":
            const { data } = res;

            setUserName(data.name);

            setUserId(data.person_id);
            setIsLogin(true);
            navigate(`/rooms`, { state: data.rooms });
            break;
          case "recon_data": //재접속시
            setIsLoading(false);
            setUserName(res.data.name);

            setUserId(res.data.person_id);
            // 재접속 분기
            if (res.response === "reconnected_game") {
              navigate(`/rooms/${res.data.room.id}/game`, { state: res.data });
            }

            if (res.response === "reconnected_result") {
              navigate(`/rooms/${res.data.room.id}/result`, {
                state: res.data,
              });
            }
        }
      };
      ws.current = socket;
    });
  }

  const ret = [createWebSocketConnection, isReady, ws.current];

  return (
    <WebsocketContext.Provider value={ret}>
      {children}
    </WebsocketContext.Provider>
  );
};
