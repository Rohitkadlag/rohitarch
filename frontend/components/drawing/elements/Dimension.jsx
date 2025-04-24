// src/components/drawing/elements/Dimension.jsx
import React, { useState, useEffect } from "react";
import { Group, Line, Text, Circle } from "react-konva";

const Dimension = ({ element, isSelected, onDragEnd, scale }) => {
  const [points, setPoints] = useState([]);
  const [dimensionText, setDimensionText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Update dimension properties when element changes
  useEffect(() => {
    if (element && element.geometry && element.geometry.points) {
      if (element.geometry.points.length >= 2) {
        setPoints(element.geometry.points);

        // Calculate distance for dimension text
        const p1 = element.geometry.points[0];
        const p2 = element.geometry.points[1];

        // Euclidean distance
        const distance = Math.sqrt(
          Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
        );

        // Format distance with unit (assuming 1 unit = 1cm)
        setDimensionText(`${distance.toFixed(0)} cm`);
      }
    }
  }, [element]);

  // Handle dimension line drag
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (e) => {
    if (!onDragEnd || points.length < 2) return;

    setIsDragging(false);

    // Calculate the offset from dragging
    const dx = e.target.x();
    const dy = e.target.y();

    // Move all points by the offset
    const newPoints = points.map((point) => ({
      x: point.x + dx,
      y: point.y + dy,
    }));

    // Create updated element
    const updatedElement = {
      ...element,
      geometry: {
        ...element.geometry,
        points: newPoints,
      },
    };

    // Reset group position to avoid accumulating transforms
    e.target.position({ x: 0, y: 0 });

    onDragEnd(element._id, updatedElement);
  };

  // Calculate offset for dimension lines
  const getDimensionLineOffset = () => {
    if (points.length < 2) return { dx: 0, dy: 0 };

    const p1 = points[0];
    const p2 = points[1];

    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const perpendicular = angle + Math.PI / 2;

    const offsetDistance = 15 / (scale || 1);
    const dx = Math.cos(perpendicular) * offsetDistance;
    const dy = Math.sin(perpendicular) * offsetDistance;

    return { dx, dy };
  };

  // Calculate midpoint for text positioning
  const getMidPoint = () => {
    if (points.length < 2) return { x: 0, y: 0 };

    const p1 = points[0];
    const p2 = points[1];

    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  };

  if (points.length < 2) return null;

  const { dx, dy } = getDimensionLineOffset();
  const midPoint = getMidPoint();

  // Generate points for dimension line with offsets
  const p1 = points[0];
  const p2 = points[1];

  const offsetP1 = { x: p1.x + dx, y: p1.y + dy };
  const offsetP2 = { x: p2.x + dx, y: p2.y + dy };

  // Calculate angle for dimension text
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
  const textAngle = angle > 90 || angle < -90 ? angle + 180 : angle;

  return (
    <Group
      draggable={!element.metadata?.locked}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Main dimension line */}
      <Line
        id={element._id}
        points={[offsetP1.x, offsetP1.y, offsetP2.x, offsetP2.y]}
        stroke={element.style?.strokeColor || "#000000"}
        strokeWidth={(element.style?.strokeWidth || 1) / (scale || 1)}
        dash={isSelected ? [5 / (scale || 1), 5 / (scale || 1)] : undefined}
        perfectDrawEnabled={false}
      />

      {/* Extension lines */}
      <Line
        points={[p1.x, p1.y, offsetP1.x, offsetP1.y]}
        stroke={element.style?.strokeColor || "#000000"}
        strokeWidth={(element.style?.strokeWidth || 1) / (scale || 1)}
        perfectDrawEnabled={false}
        listening={false}
      />
      <Line
        points={[p2.x, p2.y, offsetP2.x, offsetP2.y]}
        stroke={element.style?.strokeColor || "#000000"}
        strokeWidth={(element.style?.strokeWidth || 1) / (scale || 1)}
        perfectDrawEnabled={false}
        listening={false}
      />

      {/* Dimension cap lines */}
      <Line
        points={[
          offsetP1.x + dy / 3,
          offsetP1.y - dx / 3,
          offsetP1.x - dy / 3,
          offsetP1.y + dx / 3,
        ]}
        stroke={element.style?.strokeColor || "#000000"}
        strokeWidth={(element.style?.strokeWidth || 1) / (scale || 1)}
        perfectDrawEnabled={false}
        listening={false}
      />
      <Line
        points={[
          offsetP2.x + dy / 3,
          offsetP2.y - dx / 3,
          offsetP2.x - dy / 3,
          offsetP2.y + dx / 3,
        ]}
        stroke={element.style?.strokeColor || "#000000"}
        strokeWidth={(element.style?.strokeWidth || 1) / (scale || 1)}
        perfectDrawEnabled={false}
        listening={false}
      />

      {/* Dimension text */}
      {!isDragging && (
        <Text
          x={midPoint.x + dx - 20 / (scale || 1)}
          y={midPoint.y + dy - 10 / (scale || 1)}
          text={dimensionText}
          fontSize={12 / (scale || 1)}
          fill={element.style?.strokeColor || "#000000"}
          rotation={textAngle}
          listening={false}
        />
      )}

      {/* Selection indicators at each end */}
      {isSelected && (
        <>
          <Circle
            x={p1.x}
            y={p1.y}
            radius={5 / (scale || 1)}
            stroke="#3b82f6"
            strokeWidth={1 / (scale || 1)}
            fillEnabled={false}
            perfectDrawEnabled={false}
            listening={false}
          />
          <Circle
            x={p2.x}
            y={p2.y}
            radius={5 / (scale || 1)}
            stroke="#3b82f6"
            strokeWidth={1 / (scale || 1)}
            fillEnabled={false}
            perfectDrawEnabled={false}
            listening={false}
          />
        </>
      )}
    </Group>
  );
};

export default Dimension;
