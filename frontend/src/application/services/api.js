import axios from "axios";
import { getApiBaseUrl } from "../config/apiBase";

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

export default api;