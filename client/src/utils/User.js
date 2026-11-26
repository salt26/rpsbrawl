const USER_ID = "person_id";
const USER_NAME = "person_name";
const USER_AFFILIATION = "person_affiliation";
const IS_LOGIN = "is_login"; // 루트부터 입장을 시도하는지
export const setUserId = (id) => localStorage.setItem(USER_ID, id);
export const getUserId = (id) => localStorage.getItem(USER_ID, id);

export const setUserName = (name) => localStorage.setItem(USER_NAME, name);
export const getUserName = (name) => localStorage.getItem(USER_NAME, name);

export const setIsLogin = (isLogin) =>
  sessionStorage.setItem(IS_LOGIN, isLogin);
export const setUserAffiliation = (affiliation) =>
  localStorage.setItem(USER_AFFILIATION, affiliation);
export const getUserAffiliation = (affiliation) =>
  localStorage.getItem(USER_AFFILIATION);

export const getIsLogin = () => sessionStorage.getItem(IS_LOGIN); // 브라우저 껐다킬때마다 갱신

// 재접속 키: 브라우저 탭마다 하나씩 만드는 임의의 문자열 (새로고침해도 유지됨)
// 서버는 같은 이름·같은 키로 다시 접속하면, 아직 끊김을 알아채지 못한 이전 연결을 새 연결로 바꿔 준다.
const CLIENT_KEY = "client_key";
export const getClientKey = () => {
  let key = sessionStorage.getItem(CLIENT_KEY);
  if (!key) {
    key =
      window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(CLIENT_KEY, key);
  }
  return key;
};
export const flush = () => {
  localStorage.removeItem(USER_ID);
  localStorage.removeItem(USER_NAME);
  localStorage.removeItem(USER_AFFILIATION);
};
