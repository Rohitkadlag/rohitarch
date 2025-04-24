// src/components/drawing/elements/Wall.jsx
import React, { useState, useEffect } from "react";
import { Line, Group, Circle } from "react-konva";

const Wall = ({ element, isSelected, onDragEnd, scale, isDrawing = false }) => {
  const [points, setPoints] = useState([]);
  const [controlPoints, setControlPoints] = useState([]);

  // Convert element's points to flat array for Konva Line
  useEffect(() => {
    if (element && element.geometry && element.geometry.points) {
      // Convert from [{x, y}, {x, y}] to [x1, y1, x2, y2, ...]
      const flatPoints = [];
      element.geometry.points.forEach((point) => {
        flatPoints.push(point.x, point.y);
      });
      setPoints(flatPoints);

      // Set control points for editing
      setControlPoints(element.geometry.points);
    }
  }, [element]);

  // Handle control point drag
  const handleControlPointDrag = (index, e) => {
    const newPoints = [...controlPoints];
    newPoints[index] = {
      x: e.target.x(),
      y: e.target.y(),
    };
    setControlPoints(newPoints);

    // Update flat points array
    const flatPoints = [];
    newPoints.forEach((point) => {
      flatPoints.push(point.x, point.y);
    });
    setPoints(flatPoints);
  };

  // Update element when control point drag ends
  const handleControlPointDragEnd = (index, e) => {
    if (!onDragEnd || !element._id) return;

    const updatedElement = {
      ...element,
      geometry: {
        ...element.geometry,
        points: controlPoints,
      },
    };

    onDragEnd(element._id, updatedElement);
  };

  // Calculate stroke width for proper display with scale
  const getStrokeWidth = () => {
    const baseWidth = element.style.strokeWidth || 10;
    return baseWidth / (scale || 1);
  };

  // Render control points for edit mode
  const renderControlPoints = () => {
    if (!isSelected || isDrawing) return null;

    return controlPoints.map((point, index) => (
      <Circle
        key={index}
        x={point.x}
        y={point.y}
        radius={5 / (scale || 1)}
        fill="#3b82f6"
        stroke="#2563eb"
        strokeWidth={1 / (scale || 1)}
        draggable
        onDragMove={(e) => handleControlPointDrag(index, e)}
        onDragEnd={(e) => handleControlPointDragEnd(index, e)}
      />
    ));
  };

  // Calculate the perpendicular lines for wall thickness
  const getThicknessLines = () => {
    if (points.length < 4) return []; // Need at least 2 points for a wall

    const thickness = getStrokeWidth();
    const result = [];
    const numPoints = points.length / 2;

    for (let i = 0; i < numPoints - 1; i++) {
      const x1 = points[i * 2];
      const y1 = points[i * 2 + 1];
      const x2 = points[(i + 1) * 2];
      const y2 = points[(i + 1) * 2 + 1];

      // Calculate direction vector
      const dx = x2 - x1;
      const dy = y2 - y1;

      // Calculate perpendicular vector (normalized to 1.0)
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length === 0) continue;

      const perpX = -dy / length;
      const perpY = dx / length;

      // Calculate offset points on both sides of the line
      const offsetX = (perpX * thickness) / 2;
      const offsetY = (perpY * thickness) / 2;

      // Add the line segments for this wall segment
      const wallSegment = [
        x1 + offsetX,
        y1 + offsetY,
        x2 + offsetX,
        y2 + offsetY,
        x2 - offsetX,
        y2 - offsetY,
        x1 - offsetX,
        y1 - offsetY,
        x1 + offsetX,
        y1 + offsetY, // Close the shape
      ];

      result.push(...wallSegment);
    }

    return result;
  };

  // Join points to create wall corners
  const getJoinedWallPoints = () => {
    if (points.length < 4) return getThicknessLines(); // Simple case

    // More complex joining for multi-segment walls
    // For simplicity, this example doesn't implement full corner joining
    // In a real application, you'd implement proper corner joining logic
    return getThicknessLines();
  };

  return (
    <Group>
      {/* Actual wall with thickness */}
      <Line
        id={element._id}
        points={getJoinedWallPoints()}
        closed={true}
        fill={element.style.fillColor || "#cccccc"}
        stroke={element.style.strokeColor || "#000000"}
        strokeWidth={1 / (scale || 1)}
        perfectDrawEnabled={false}
        listening={true}
      />

      {/* Center line for visualization */}
      <Line
        points={points}
        stroke={isSelected ? "#3b82f6" : "transparent"}
        strokeWidth={1 / (scale || 1)}
        dash={[5 / (scale || 1), 5 / (scale || 1)]}
        perfectDrawEnabled={false}
        listening={false}
      />

      {/* Control points */}
      {renderControlPoints()}
    </Group>
  );
};

export default Wall;
