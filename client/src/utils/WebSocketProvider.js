import { useState, useRef, useEffect } from "react";
import { createContext } from "react";
import { BASE_WEBSOCKET_URL } from "../Config";
export const WebsocketContext = createContext([false, null, () => {}]);

//                                            ready, value, send

// Make sure to put WebsocketProvider higher up in
// the component tree than any consumers.
export const WebsocketProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [res, setRes] = useState(null);

  const ws = useRef(null);
  // 웹소켓 연결

  function createWebSocketConnection(affiliation, name) {
    const socket = new WebSocket(
      `${BASE_WEBSOCKET_URL}/join?affiliation=${affiliation}&name=${name}`
    );

    socket.onopen = (event) => {
      console.log("Socket open", event);
      setIsReady(true);
    };

    socket.onclose = (event) => {
      console.log("onclose!", event);
      setIsReady(false);
    };
    socket.onmessage = function (event) {
      const data = JSON.parse(event.data); // 전달된 json string을 object로 변환
      setRes(data);

      console.log("onmessage", data.type, data);
    };

    ws.current = socket;
  }

  const ret = [
    createWebSocketConnection,
    isReady,
    res,
    ws.current?.send.bind(ws.current),
  ];

  return (
    <WebsocketContext.Provider value={ret}>
      {children}
    </WebsocketContext.Provider>
  );
};
