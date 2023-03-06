import React, { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getIsLogin } from "./User";

import { WebsocketContext } from "./WebSocketProvider";

// 로그인 유저만 접근 가능
// 비로그인 유저 접근 불가
const PrivateRoute = () => {
  const [createWebSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 사용

  if (!ready) {
    alert("login required");
  }

  return ready ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
