// src/components/drawing/elements/Room.jsx
import React, { useState, useEffect } from "react";
import { Group, Line, Text } from "react-konva";

const Room = ({ element, isSelected, onDragEnd, scale }) => {
  const [points, setPoints] = useState([]);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [roomName, setRoomName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Update room properties when element changes
  useEffect(() => {
    if (element && element.geometry && element.geometry.points) {
      setPoints(element.geometry.points);

      // Calculate room center for label
      if (element.geometry.points.length > 0) {
        const xSum = element.geometry.points.reduce((sum, p) => sum + p.x, 0);
        const ySum = element.geometry.points.reduce((sum, p) => sum + p.y, 0);
        setCenter({
          x: xSum / element.geometry.points.length,
          y: ySum / element.geometry.points.length,
        });
      }

      // Get room name from metadata
      setRoomName(element.metadata?.name || "");
    }
  }, [element]);

  // Convert points array to flat array for Konva Line
  const getFlatPoints = () => {
    const flatPoints = [];
    points.forEach((point) => {
      flatPoints.push(point.x, point.y);
    });
    // Close the shape by adding the first point again
    if (points.length > 0) {
      flatPoints.push(points[0].x, points[0].y);
    }
    return flatPoints;
  };

  // Handle room drag
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (e) => {
    if (!onDragEnd || !points.length) return;

    setIsDragging(false);

    // Calculate the offset from dragging
    const dx = e.target.x();
    const dy = e.target.y();

    // Move all points by the offset
    const newPoints = points.map((point) => ({
      x: point.x + dx,
      y: point.y + dy,
    }));

    // Update center point
    setCenter({
      x: center.x + dx,
      y: center.y + dy,
    });

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

  return (
    <Group
      draggable={!element.metadata?.locked}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Room polygon */}
      <Line
        id={element._id}
        points={getFlatPoints()}
        closed={true}
        fill={element.style?.fillColor || "rgba(200, 200, 200, 0.2)"}
        stroke={element.style?.strokeColor || "#000000"}
        strokeWidth={(element.style?.strokeWidth || 1) / (scale || 1)}
        opacity={element.style?.opacity || 1}
        dash={isSelected ? [5 / (scale || 1), 5 / (scale || 1)] : undefined}
        perfectDrawEnabled={false}
      />

      {/* Room label */}
      {!isDragging && roomName && (
        <Text
          x={center.x - 50 / (scale || 1)}
          y={center.y - 10 / (scale || 1)}
          width={100 / (scale || 1)}
          text={roomName}
          fontSize={14 / (scale || 1)}
          fill="#000000"
          align="center"
          listening={false}
        />
      )}

      {/* Selection indicators at each corner */}
      {isSelected &&
        points.map((point, index) => (
          <Line
            key={index}
            points={[
              point.x - 5 / (scale || 1),
              point.y - 5 / (scale || 1),
              point.x + 5 / (scale || 1),
              point.y - 5 / (scale || 1),
              point.x + 5 / (scale || 1),
              point.y + 5 / (scale || 1),
              point.x - 5 / (scale || 1),
              point.y + 5 / (scale || 1),
              point.x - 5 / (scale || 1),
              point.y - 5 / (scale || 1),
            ]}
            stroke="#3b82f6"
            strokeWidth={1 / (scale || 1)}
            closed={true}
            fillEnabled={false}
            perfectDrawEnabled={false}
            listening={false}
          />
        ))}
    </Group>
  );
};

export default Room;
