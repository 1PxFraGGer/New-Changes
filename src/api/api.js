import axios from "axios";

const api = axios.create({
    baseURL: "https://api.geduconnect.com/api",
    withCredentials: true // 🔥 REQUIRED
});

export default api;