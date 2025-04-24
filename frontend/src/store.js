import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/auth";
import projectReducer from "./reducers/project";
import drawingReducer from "./reducers/drawing";
import elementReducer from "./reducers/element";
import alertReducer from "./reducers/alert";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    drawing: drawingReducer,
    element: elementReducer,
    alert: alertReducer,
  },
});
