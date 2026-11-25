// 기기 시계는 서버와 몇 초씩 다를 수 있으므로, 남은 시간은 서버 시각을 기준으로 계산한다.
let synced = null; // { server: 서버 시각(ms), local: 그때의 performance.now() }

export const syncServerTime = (serverTime) => {
  if (typeof serverTime === "number") {
    synced = { server: serverTime, local: performance.now() };
  }
};

// 지금의 서버 시각(ms). performance.now()를 써서 도중에 기기 시계가 바뀌어도 영향받지 않는다.
export const serverNow = () =>
  synced ? synced.server + (performance.now() - synced.local) : Date.now();

// 서버 형식(2023-01-03 00:35:41.029853 KST) => ms
export const parseServerTime = (str) =>
  new Date(str.slice(0, 23).replace(" ", "T") + "+09:00").getTime();
