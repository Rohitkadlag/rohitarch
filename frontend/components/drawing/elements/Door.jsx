// src/components/drawing/elements/Door.jsx
import React, { useState, useEffect } from "react";
import { Group, Rect, Arc, Line } from "react-konva";

const Door = ({ element, isSelected, onDragEnd, scale }) => {
  const [doorProps, setDoorProps] = useState({
    x: 0,
    y: 0,
    width: 80,
    height: 10,
    rotation: 0,
    openingAngle: 90,
    openDirection: "inside", // 'inside' or 'outside'
  });

  // Update door properties when element changes
  useEffect(() => {
    if (element && element.geometry) {
      // Extract door position from the first point
      const position = element.geometry.points?.[0] || { x: 0, y: 0 };

      setDoorProps({
        x: position.x,
        y: position.y,
        width: element.geometry.width || 80,
        height: element.geometry.height || 10,
        rotation: element.geometry.rotation || 0,
        openingAngle: element.geometry.openingAngle || 90,
        openDirection: element.geometry.openDirection || "inside",
      });
    }
  }, [element]);

  // Handle door drag
  const handleDragEnd = (e) => {
    if (!onDragEnd) return;

    const newPosition = {
      x: e.target.x(),
      y: e.target.y(),
    };

    const updatedElement = {
      ...element,
      geometry: {
        ...element.geometry,
        points: [newPosition],
        rotation: doorProps.rotation,
      },
    };

    onDragEnd(element._id, updatedElement);
  };

  // Calculate the door arc path based on opening angle and direction
  const renderDoorArc = () => {
    const { width, openingAngle, openDirection } = doorProps;
    const radius = width;
    const startAngle = openDirection === "inside" ? 180 : 0;
    const endAngle =
      openDirection === "inside" ? 180 - openingAngle : openingAngle;

    return (
      <Arc
        x={0}
        y={0}
        innerRadius={0}
        outerRadius={radius}
        angle={openingAngle}
        rotation={startAngle}
        fillEnabled={false}
        stroke={element.style?.strokeColor || "#000000"}
        strokeWidth={(element.style?.strokeWidth || 1) / (scale || 1)}
        dash={isSelected ? [5 / (scale || 1), 5 / (scale || 1)] : undefined}
      />
    );
  };

  return (
    <Group
      x={doorProps.x}
      y={doorProps.y}
      rotation={doorProps.rotation}
      draggable={!element.metadata?.locked}
      onDragEnd={handleDragEnd}
    >
      {/* Door frame/wall opening */}
      <Rect
        id={element._id}
        x={-doorProps.width / 2}
        y={-doorProps.height / 2}
        width={doorProps.width}
        height={doorProps.height}
        fill={element.style?.fillColor || "#cccccc"}
        stroke={element.style?.strokeColor || "#000000"}
        strokeWidth={(element.style?.strokeWidth || 1) / (scale || 1)}
        opacity={element.style?.opacity || 1}
        perfectDrawEnabled={false}
      />

      {/* Door swing arc */}
      {renderDoorArc()}

      {/* Selection indicator */}
      {isSelected && (
        <Rect
          x={-doorProps.width / 2 - 5 / (scale || 1)}
          y={-doorProps.height / 2 - 5 / (scale || 1)}
          width={doorProps.width + 10 / (scale || 1)}
          height={doorProps.height + 10 / (scale || 1)}
          stroke="#3b82f6"
          strokeWidth={1 / (scale || 1)}
          dash={[5 / (scale || 1), 5 / (scale || 1)]}
          fillEnabled={false}
          perfectDrawEnabled={false}
          listening={false}
        />
      )}
    </Group>
  );
};

export default Door;
