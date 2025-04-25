import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../components/dashboard/Dashboard";
import DrawingEditor from "../components/drawing/DrawingEditor";
import "./App.css";

function App() {
  return (
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
  );
}

export default App;
