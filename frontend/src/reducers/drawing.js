// src/reducers/drawing.js
import {
  GET_DRAWING,
  ADD_DRAWING,
  UPDATE_DRAWING,
  DELETE_DRAWING,
  DRAWING_ERROR,
  CLEAR_DRAWINGS,
} from "../actions/types";

const initialState = {
  drawing: null,
  drawings: [],
  loading: true,
  error: {},
};

export default function drawingReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_DRAWING:
      return {
        ...state,
        drawing: payload,
        loading: false,
      };
    case ADD_DRAWING:
      return {
        ...state,
        drawings: [payload, ...state.drawings],
        loading: false,
      };
    case UPDATE_DRAWING:
      return {
        ...state,
        drawing: payload,
        drawings: state.drawings.map((drawing) =>
          drawing._id === payload._id ? payload : drawing
        ),
        loading: false,
      };
    case DELETE_DRAWING:
      return {
        ...state,
        drawing: null,
        drawings: state.drawings.filter((drawing) => drawing._id !== payload),
        loading: false,
      };
    case DRAWING_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    case CLEAR_DRAWINGS:
      return {
        ...state,
        drawing: null,
        drawings: [],
        loading: false,
      };
    default:
      return state;
  }
}
