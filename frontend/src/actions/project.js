// src/actions/project.js
import api from "../../utils/api";
import {
  GET_PROJECTS,
  GET_PROJECT,
  ADD_PROJECT,
  UPDATE_PROJECT,
  DELETE_PROJECT,
  PROJECT_ERROR,
  CLEAR_PROJECTS,
} from "./types";
import { setAlert } from "./alert";
import axios from "axios"; // This is missing

// Get all projects
export const getProjects = () => async (dispatch) => {
  try {
    const res = await api.get("/projects");

    dispatch({
      type: GET_PROJECTS,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: PROJECT_ERROR,
      payload: {
        msg: err.response?.statusText,
        status: err.response?.status,
      },
    });
  }
};

// Create a project
export const createProject = (formData) => async (dispatch) => {
  try {
    const res = await api.post("/projects", formData);

    dispatch({
      type: ADD_PROJECT,
      payload: res.data,
    });

    dispatch(setAlert("Project created", "success"));

    return res.data; // Return for redirect
  } catch (err) {
    const errors = err.response?.data?.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }

    dispatch({
      type: PROJECT_ERROR,
      payload: {
        msg: err.response?.statusText,
        status: err.response?.status,
      },
    });
  }
};

// Update a project
export const updateProject = (id, formData) => async (dispatch) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = await axios.put(`/api/projects/${id}`, formData, config);

    dispatch({
      type: UPDATE_PROJECT,
      payload: res.data,
    });

    dispatch(setAlert("Project updated", "success"));
  } catch (err) {
    dispatch({
      type: PROJECT_ERROR,
      payload: {
        msg: err.response?.statusText,
        status: err.response?.status,
      },
    });
  }
};

// Delete a project
export const deleteProject = (id) => async (dispatch) => {
  try {
    await axios.delete(`/api/projects/${id}`);

    dispatch({
      type: DELETE_PROJECT,
      payload: id,
    });

    dispatch(setAlert("Project removed", "success"));
  } catch (err) {
    dispatch({
      type: PROJECT_ERROR,
      payload: {
        msg: err.response?.statusText,
        status: err.response?.status,
      },
    });
  }
};

// Add a collaborator to a project
export const addCollaborator = (projectId, email) => async (dispatch) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = await axios.post(
      `/api/projects/${projectId}/collaborators`,
      { email },
      config
    );

    dispatch({
      type: UPDATE_PROJECT,
      payload: res.data,
    });

    dispatch(setAlert("Collaborator added", "success"));
  } catch (err) {
    dispatch({
      type: PROJECT_ERROR,
      payload: {
        msg: err.response?.statusText,
        status: err.response?.status,
      },
    });
  }
};

// Clear projects
export const clearProjects = () => (dispatch) => {
  dispatch({ type: CLEAR_PROJECTS });
};
