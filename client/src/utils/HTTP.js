import axios, { AxiosInstance } from "axios";

import { BASE_SERVER_URL } from "../Config";
//token이 없을때에는 일반 axios 요청
const HTTP = axios.create({
  baseURL: BASE_SERVER_URL,
  credentials: "include",
  withCredentials: true,
  crossDomain: true,
});

export default HTTP;
