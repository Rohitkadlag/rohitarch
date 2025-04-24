// src/actions/drawing.js
import axios from "axios";
import {
  GET_DRAWING,
  ADD_DRAWING,
  UPDATE_DRAWING,
  DELETE_DRAWING,
  DRAWING_ERROR,
  CLEAR_DRAWINGS,
  CLEAR_ELEMENTS,
} from "./types";
import { setAlert } from "./alert";

// Get a single drawing
export const getDrawing = (drawingId) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/drawings/${drawingId}`);

    dispatch({
      type: GET_DRAWING,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: DRAWING_ERROR,
      payload: {
        msg: err.response?.statusText,
        status: err.response?.status,
      },
    });
  }
};

// Create a new drawing
export const createDrawing = (projectId, formData) => async (dispatch) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = await axios.post(
      `/api/drawings/project/${projectId}`,
      formData,
      config
    );

    dispatch({
      type: ADD_DRAWING,
      payload: res.data,
    });

    dispatch(setAlert("Drawing created", "success"));

    return res.data; // Return the new drawing for redirection
  } catch (err) {
    dispatch({
      type: DRAWING_ERROR,
      payload: {
        msg: err.response?.statusText,
        status: err.response?.status,
      },
    });
  }
};

// Update a drawing
export const updateDrawing = (drawingId, formData) => async (dispatch) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = await axios.put(`/api/drawings/${drawingId}`, formData, config);

    dispatch({
      type: UPDATE_DRAWING,
      payload: res.data,
    });

    dispatch(setAlert("Drawing updated", "success"));
  } catch (err) {
    dispatch({
      type: DRAWING_ERROR,
      payload: {
        msg: err.response?.statusText,
        status: err.response?.status,
      },
    });
  }
};

// Delete a drawing
export const deleteDrawing = (drawingId) => async (dispatch) => {
  try {
    await axios.delete(`/api/drawings/${drawingId}`);

    dispatch({
      type: DELETE_DRAWING,
      payload: drawingId,
    });

    dispatch({
      type: CLEAR_ELEMENTS,
    });

    dispatch(setAlert("Drawing removed", "success"));
  } catch (err) {
    dispatch({
      type: DRAWING_ERROR,
      payload: {
        msg: err.response?.statusText,
        status: err.response?.status,
      },
    });
  }
};

// Clear drawings
export const clearDrawings = () => (dispatch) => {
  dispatch({ type: CLEAR_DRAWINGS });
};
