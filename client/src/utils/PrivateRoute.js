import React, { useContext, useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getIsLogin, getUserName } from "./User";
import { Language } from "../db/Language";
import { LanguageContext } from "../utils/LanguageProvider";
import { Medium } from "../styles/font";

import { WebsocketContext } from "./WebSocketProvider";

// "재접속 중" 뒤의 점이 0.3초마다 . → .. → ... 순서로 반복됨
const ReconnectingMessage = ({ mode }) => {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => setDots((d) => (d % 3) + 1), 300);
    return () => clearInterval(timer);
  }, []);

  return (
    <Medium size="40px" color="white" shadow>
      {Language[mode].reconnecting.replace(/\.+$/, "")}
      {/* 점 개수가 바뀌어도 문구가 흔들리지 않도록 너비 고정 */}
      <span style={{ display: "inline-block", width: "1.2em", textAlign: "left" }}>
        {".".repeat(dots)}
      </span>
    </Medium>
  );
};

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
        }}
      >
        <ReconnectingMessage mode={mode} />
      </div>
    );
  }

  alert(Language[mode].page_not_found);
  return <Navigate to="/" />;
};

export default PrivateRoute;
