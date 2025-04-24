// src/actions/element.js
import axios from "axios";
import {
  GET_ELEMENTS,
  ADD_ELEMENT,
  UPDATE_ELEMENT,
  DELETE_ELEMENT,
  BATCH_UPDATE_ELEMENTS,
  ELEMENT_ERROR,
} from "./types";
import { setAlert } from "./alert";

// Get all elements for a drawing
export const getElements = (drawingId) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/drawings/${drawingId}/elements`);

    dispatch({
      type: GET_ELEMENTS,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: ELEMENT_ERROR,
      payload: {
        msg: err.response?.statusText,
        status: err.response?.status,
      },
    });
  }
};

// Create a new element
export const createElement = (elementData) => async (dispatch) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = await axios.post(
      `/api/drawings/${elementData.drawing}/elements`,
      elementData,
      config
    );

    dispatch({
      type: ADD_ELEMENT,
      payload: res.data,
    });

    dispatch(setAlert("Element created", "success"));
  } catch (err) {
    dispatch({
      type: ELEMENT_ERROR,
      payload: {
        msg: err.response?.statusText,
        status: err.response?.status,
      },
    });
  }
};

// Update an element
export const updateElement = (elementId, elementData) => async (dispatch) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = await axios.put(
      `/api/elements/${elementId}`,
      elementData,
      config
    );

    dispatch({
      type: UPDATE_ELEMENT,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: ELEMENT_ERROR,
      payload: {
        msg: err.response?.statusText,
        status: err.response?.status,
      },
    });
  }
};

// Delete an element
export const deleteElement = (elementId) => async (dispatch) => {
  try {
    await axios.delete(`/api/elements/${elementId}`);

    dispatch({
      type: DELETE_ELEMENT,
      payload: elementId,
    });

    dispatch(setAlert("Element removed", "success"));
  } catch (err) {
    dispatch({
      type: ELEMENT_ERROR,
      payload: {
        msg: err.response?.statusText,
        status: err.response?.status,
      },
    });
  }
};

// Batch update elements (for performance)
export const batchUpdateElements =
  (drawingId, elements) => async (dispatch) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const res = await axios.put(
        `/api/drawings/${drawingId}/elements/batch`,
        { elements },
        config
      );

      dispatch({
        type: BATCH_UPDATE_ELEMENTS,
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: ELEMENT_ERROR,
        payload: {
          msg: err.response?.statusText,
          status: err.response?.status,
        },
      });
    }
  };
