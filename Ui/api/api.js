import axios from "axios";

const API = axios.create({
  baseURL: "https://mealsystem.onrender.com/api",
});

export default API;