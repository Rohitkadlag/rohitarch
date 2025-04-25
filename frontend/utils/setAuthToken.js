// src/utils/setAuthToken.js
import axios from "axios";

const setAuthToken = (token) => {
  if (token) {
    // Apply to every request
    axios.defaults.headers.common["x-auth-token"] = token;

    // For other axios instances you might be using
    localStorage.setItem("token", token);
  } else {
    // Delete auth header
    delete axios.defaults.headers.common["x-auth-token"];
    localStorage.removeItem("token");
  }
};

export default setAuthToken;
