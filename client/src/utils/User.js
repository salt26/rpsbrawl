const USER_ID = "person_id";
const USER_NAME = "person_name";
const USER_AFFILIATION = "person_affiliation";

export const setUserId = (id) => localStorage.setItem(USER_ID, id);
export const getUserId = (id) => localStorage.getItem(USER_ID, id);

export const setUserName = (name) => localStorage.setItem(USER_NAME, name);
export const getUserName = (name) => localStorage.getItem(USER_NAME, name);

export const setUserAffiliation = (affiliation) =>
  localStorage.setItem(USER_AFFILIATION, affiliation);
export const getUserAffiliation = (affiliation) =>
  localStorage.getItem(USER_AFFILIATION);

export const flush = () => {
  localStorage.removeItem(USER_ID);
  localStorage.removeItem(USER_NAME);
  localStorage.removeItem(USER_AFFILIATION);
};
