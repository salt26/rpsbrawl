import { useState, useRef, useEffect } from "react";
import { createContext } from "react";
import { setUserId, setUserName } from "./User";
import { useNavigate } from "react-router-dom";
import { setIsLogin } from "./User";
import { Language } from "../db/Language";
import { LanguageContext } from "./LanguageProvider";
import { useContext } from "react";
import { BASE_WEBSOCKET_URL } from "../Config";
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
  // 웹소켓 연결

  function createWebSocketConnection(name) {
    const token = localStorage.getItem("access_token");

    console.log(token);
    const socket = new WebSocket(
      `${BASE_WEBSOCKET_URL}/signin?name=${name}&token=${token}`
    );

    socket.onopen = (event) => {
      console.log("Socket open", event);
      setIsReady(true);
    };

    socket.onclose = (event) => {
      console.log("onclose!", event);

      // 방목록에서 <- 버튼 눌렀을때는 제외하구

      alert(Language[mode].reconnection_request);
      setIsReady(false);
      navigate("/");
    };

    socket.onmessage = function (event) {
      const res = JSON.parse(event.data);
      // 전달된 json string을 object로 변환
      console.log("onmessage", res.type, res);
      console.log(res);
      if (res?.response === "error") {
        alert(res.message);
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
          setUserName(res.data.name);

          setUserId(res.data.person_id);
          // 재접속 분기
          if (res.response === "reconnected_game") {
            navigate(`/rooms/${res.data.room.id}/game`, { state: res.data });
          }

          if (res.response === "reconnected_result") {
            navigate(`/rooms/${res.data.room.id}/result`, { state: res.data });
          }
      }
    };
    ws.current = socket;
  }

  const ret = [createWebSocketConnection, isReady, ws.current];

  return (
    <WebsocketContext.Provider value={ret}>
      {children}
    </WebsocketContext.Provider>
  );
};
