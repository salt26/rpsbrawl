import axios, { AxiosInstance } from "axios";

import { BASE_SERVER_URL } from "../Config";

sessionStorage.getItem("accessToken");
//token이 없을때에는 일반 axios 요청
const HTTP = axios.create({
  baseURL: BASE_SERVER_URL,
  credentials: "include",
  withCredentials: true,
  crossDomain: true,
});

sessionStorage.getItem("accessToken");

export default HTTP;
