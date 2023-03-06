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
export const flush = () => {
  localStorage.removeItem(USER_ID);
  localStorage.removeItem(USER_NAME);
  localStorage.removeItem(USER_AFFILIATION);
};
