import { useState, useRef } from "react";
import { createContext } from "react";
import axios from "axios";
import qs from "qs";
import {
  setUserId,
  setUserName,
  getUserName,
  getIsLogin,
  getClientKey,
} from "./User";
import { useNavigate } from "react-router-dom";
import { setIsLogin } from "./User";
import { syncServerTime } from "./ServerTime";
import { Language } from "../db/Language";
import { LanguageContext } from "./LanguageProvider";
import { useContext } from "react";

// [createWebSocketConnection, ready, ws, signIn, reconnecting, resume]
export const WebsocketContext = createContext([
  () => {},
  false,
  null,
  async () => {},
  false,
  () => {},
]);

// 연결이 비정상적으로 끊겼을 때 다시 시도하기까지 기다리는 시간(ms). 모두 실패하면(약 26초) 로그인 화면으로 보낸다.
const RECONNECT_DELAYS = [0, 1000, 2000, 3000, 5000, 5000, 5000, 5000];

// 토큰은 한 번만 쓸 수 있으므로 접속할 때마다 새로 받는다.
async function requestToken() {
  const body = {
    grant_type: "",
    username: process.env.REACT_APP_RPS_USERNAME,
    password: process.env.REACT_APP_RPS_PASSWORD,
    scope: "",
    client_id: "",
    client_secret: "",
  };
  const response = await axios.post(
    `${process.env.REACT_APP_RPS_BASE_SERVER_URL}/token`,
    qs.stringify(body),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    }
  );
  localStorage.setItem("access_token", response.data.access_token);
}

// Make sure to put WebsocketProvider higher up in
// the component tree than any consumers.
export const WebsocketProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const mode = useContext(LanguageContext);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const navigate = useNavigate();
  const ws = useRef(null);
  const signinRejected = useRef(false); // 서버가 로그인을 거절했는지 (지금 연결 기준)
  const reconnect = useRef({ active: false, attempt: 0, timer: null });

  function finishReconnect() {
    const r = reconnect.current;
    if (r.timer) clearTimeout(r.timer);
    r.active = false;
    r.attempt = 0;
    r.timer = null;
    setReconnecting(false);
  }

  function giveUpReconnect() {
    finishReconnect();
    alert(Language[modeRef.current].reconnection_request);
    navigate("/");
  }

  function scheduleReconnect() {
    const r = reconnect.current;
    if (r.attempt >= RECONNECT_DELAYS.length) {
      giveUpReconnect();
      return;
    }
    const delay = RECONNECT_DELAYS[r.attempt++];
    r.timer = setTimeout(async () => {
      r.timer = null;
      try {
        await requestToken();
      } catch (error) {
        // 아직 네트워크가 돌아오지 않음
        if (reconnect.current.active) scheduleReconnect();
        return;
      }
      // 연결이 끊기면 onclose에서 다음 시도를 예약하고, 로그인 응답을 받으면 재접속을 마친다.
      createWebSocketConnection(getUserName()).catch(() => {});
    }, delay);
  }

  // 새로고침했거나 연결이 비정상적으로 끊겼을 때, 이 탭에서 쓰던 이름으로 다시 접속
  function resume() {
    if (reconnect.current.active) return;
    reconnect.current.active = true;
    reconnect.current.attempt = 0;
    setReconnecting(true);
    scheduleReconnect();
  }

  // 입장 화면에서 이름을 입력했을 때
  async function signIn(name, setIsLoading) {
    await requestToken();
    await createWebSocketConnection(name, setIsLoading);
  }

  // 웹소켓 연결
  function createWebSocketConnection(name, setIsLoading) {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem("access_token");

      const socket = new WebSocket(
        `${process.env.REACT_APP_RPS_BASE_WEBSOCKET_URL}/signin?name=${encodeURIComponent(
          name
        )}&token=${token}&key=${encodeURIComponent(getClientKey())}`
      );
      let opened = false;
      signinRejected.current = false;

      // 페이지마다 onmessage를 바꿔 끼우므로, 시각 동기화는 별도 리스너로 처리
      socket.addEventListener("message", (event) => {
        if (!event.data.includes('"server_time"')) return;
        const data = JSON.parse(event.data)?.data;
        syncServerTime(data?.server_time ?? data?.room?.server_time);
      });

      // 로그인 응답도 페이지가 onmessage를 바꿔 끼워도 받을 수 있도록 별도 리스너로 처리
      socket.addEventListener("message", (event) => {
        const res = JSON.parse(event.data);
        if (res?.request !== "signin") return;

        if (res.response === "error") {
          signinRejected.current = true;
          // 재접속 중에는 알림 없이 onclose에서 처리
          if (!reconnect.current.active) alert(res.message);
          return;
        }

        switch (res.type) {
          case "profile_and_room_list":
            setUserName(res.data.name);
            setUserId(res.data.person_id);
            setIsLogin(true);
            navigate(`/rooms`, { state: res.data.rooms });
            finishReconnect();
            break;
          case "recon_data": // 재접속 시 (게임 중이거나 결과 화면인 방)
            if (setIsLoading) setIsLoading(false);
            setUserName(res.data.name);
            setUserId(res.data.person_id);
            setIsLogin(true);
            // 재접속 분기
            if (res.response === "reconnected_game") {
              navigate(`/rooms/${res.data.room.id}/game`, { state: res.data });
            }
            if (res.response === "reconnected_result") {
              navigate(`/rooms/${res.data.room.id}/result`, {
                state: res.data,
              });
            }
            finishReconnect();
            break;
          default:
            break;
        }
      });

      socket.onopen = (event) => {
        console.log("Socket open", event);
        opened = true;
        setIsReady(true);
        resolve(socket);
      };

      socket.onclose = (event) => {
        console.log("onclose!", event);
        if (ws.current !== socket) return; // 이미 새 연결로 바뀐 이전 연결
        setIsReady(false);
        if (!opened) reject(event);

        if (reconnect.current.active) {
          // 재접속 시도 중에 끊김: 서버가 거절했으면 포기, 아니면 다음 시도
          if (signinRejected.current) giveUpReconnect();
          else scheduleReconnect();
          return;
        }

        // 로그인이 거절됨 (알림은 이미 띄움)
        if (signinRejected.current) return;

        // 네트워크 문제 등으로 비정상적으로 끊김: 같은 이름으로 자동 재접속
        if (event.code === 1006 && getIsLogin() === "true" && getUserName()) {
          resume();
          return;
        }

        // 서버가 연결을 닫음 (로그아웃, 다른 곳에서 같은 이름으로 접속 등)
        const currentPath = window.location.href.replace(
          window.location.origin,
          ""
        );
        if (currentPath === "/rooms") {
          navigate("/");
        }
        // 그 밖의 화면에서는 PrivateRoute가 입장 화면으로 보낸다.
      };

      // 페이지가 onmessage를 바꿔 끼우기 전의 기본 처리: 로그인 외 요청의 오류 알림
      socket.onmessage = function (event) {
        const res = JSON.parse(event.data);
        if (res?.response === "error" && res?.request !== "signin") {
          alert(res.message);
        }
      };
      ws.current = socket;
    });
  }

  const ret = [
    createWebSocketConnection,
    isReady,
    ws.current,
    signIn,
    reconnecting,
    resume,
  ];

  return (
    <WebsocketContext.Provider value={ret}>
      {children}
    </WebsocketContext.Provider>
  );
};
