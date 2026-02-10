import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3000/api", // tu backend
    withCredentials: true,
});
