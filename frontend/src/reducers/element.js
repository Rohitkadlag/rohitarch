// src/reducers/element.js
import {
  GET_ELEMENTS,
  ADD_ELEMENT,
  UPDATE_ELEMENT,
  DELETE_ELEMENT,
  BATCH_UPDATE_ELEMENTS,
  ELEMENT_ERROR,
  CLEAR_ELEMENTS,
} from "../actions/types";

const initialState = {
  elements: [],
  loading: true,
  error: {},
};

export default function elementReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_ELEMENTS:
      return {
        ...state,
        elements: payload,
        loading: false,
      };
    case ADD_ELEMENT:
      return {
        ...state,
        elements: [...state.elements, payload],
        loading: false,
      };
    case UPDATE_ELEMENT:
      return {
        ...state,
        elements: state.elements.map((element) =>
          element._id === payload._id ? payload : element
        ),
        loading: false,
      };
    case DELETE_ELEMENT:
      return {
        ...state,
        elements: state.elements.filter((element) => element._id !== payload),
        loading: false,
      };
    case BATCH_UPDATE_ELEMENTS:
      return {
        ...state,
        elements: payload,
        loading: false,
      };
    case ELEMENT_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    case CLEAR_ELEMENTS:
      return {
        ...state,
        elements: [],
        loading: false,
      };
    default:
      return state;
  }
}
