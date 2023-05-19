import React, { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getIsLogin } from "./User";
import { Language } from "../db/Language";
import { LanguageContext } from "../utils/LanguageProvider";

import { WebsocketContext } from "./WebSocketProvider";

// 로그인 유저만 접근 가능
// 비로그인 유저 접근 불가
const PrivateRoute = () => {
  const mode = useContext(LanguageContext);

  const savedMode = localStorage.getItem("language_mode");
  const [createWebSocketConnection, ready, ws] = useContext(WebsocketContext); //전역 소켓 사용

  if (!ready) {
    alert(Language[mode].page_not_found);
  }

  return ready ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
