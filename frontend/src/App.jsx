import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import Dashboard from "../components/dashboard/Dashboard";
import DrawingEditor from "../components/drawing/DrawingEditor";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects/:projectId" element={<Dashboard />} />
          <Route
            path="/projects/:projectId/drawings/:drawingId"
            element={<DrawingEditor />}
          />
        </Routes>
      </div>
    </Provider>
  );
}

export default App;
