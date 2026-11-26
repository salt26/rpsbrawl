import React, { useContext, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getIsLogin, getUserName } from "./User";
import { Language } from "../db/Language";
import { LanguageContext } from "../utils/LanguageProvider";

import { WebsocketContext } from "./WebSocketProvider";

// 로그인 유저만 접근 가능
// 비로그인 유저 접근 불가
// 새로고침 직후(이 페이지에서 아직 연결한 적이 없을 때)에는 이 탭에서 쓰던 이름으로 자동 재접속한다.
const PrivateRoute = () => {
  const mode = useContext(LanguageContext);

  const [, ready, ws, , reconnecting, resume] = useContext(WebsocketContext); //전역 소켓 사용

  const canResume =
    ws === null && getIsLogin() === "true" && Boolean(getUserName());

  useEffect(() => {
    if (!ready && !reconnecting && canResume) resume();
  }, [ready, reconnecting, canResume]);

  if (ready && !reconnecting) return <Outlet />;

  if (reconnecting || canResume) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100vh",
          color: "white",
          fontSize: "28px",
        }}
      >
        {Language[mode].reconnecting}
      </div>
    );
  }

  alert(Language[mode].page_not_found);
  return <Navigate to="/" />;
};

export default PrivateRoute;
