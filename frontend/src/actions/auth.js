// src/actions/auth.js
import axios from "axios";
import setAuthToken from "../../utils/setAuthToken";
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_PROJECTS,
} from "./types";
import { setAlert } from "./alert";

// Load User
export const loadUser = () => async (dispatch) => {
  // Check if token exists in localStorage
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    const res = await axios.get("/api/auth/user");

    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

// Register User
export const register =
  ({ name, email, password }) =>
  async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const body = JSON.stringify({ name, email, password });

    try {
      const res = await axios.post("/api/auth/register", body, config);

      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data,
      });

      // Set token and load user
      setAuthToken(res.data.token);
      dispatch(loadUser());
    } catch (err) {
      const errors = err.response?.data?.errors;

      if (errors) {
        errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
      }

      dispatch({
        type: REGISTER_FAIL,
      });
    }
  };

// Login User
export const login = (email, password) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const body = JSON.stringify({ email, password });

  try {
    const res = await axios.post("/api/auth/login", body, config);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });

    // Set token and load user
    setAuthToken(res.data.token);
    dispatch(loadUser());
  } catch (err) {
    const errors = err.response?.data?.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }

    dispatch({
      type: LOGIN_FAIL,
    });
  }
};

// Logout
export const logout = () => (dispatch) => {
  // Remove token
  setAuthToken(false);

  // Clear projects
  dispatch({ type: CLEAR_PROJECTS });

  // Logout user
  dispatch({ type: LOGOUT });
};
