// src/components/drawing/elements/Window.jsx
import React, { useState, useEffect } from "react";
import { Group, Rect, Line } from "react-konva";

const Window = ({ element, isSelected, onDragEnd, scale }) => {
  const [windowProps, setWindowProps] = useState({
    x: 0,
    y: 0,
    width: 80,
    height: 5,
    rotation: 0,
    windowType: "single", // 'single', 'double', 'sliding', etc.
  });

  // Update window properties when element changes
  useEffect(() => {
    if (element && element.geometry) {
      // Extract window position from the first point
      const position = element.geometry.points?.[0] || { x: 0, y: 0 };

      setWindowProps({
        x: position.x,
        y: position.y,
        width: element.geometry.width || 80,
        height: element.geometry.height || 5,
        rotation: element.geometry.rotation || 0,
        windowType: element.geometry.windowType || "single",
      });
    }
  }, [element]);

  // Handle window drag
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
        rotation: windowProps.rotation,
      },
    };

    onDragEnd(element._id, updatedElement);
  };

  // Render window panes based on window type
  const renderWindowPanes = () => {
    const { width, height, windowType } = windowProps;

    switch (windowType) {
      case "double":
        return (
          <>
            <Line
              points={[-width / 2, 0, width / 2, 0]}
              stroke={element.style?.strokeColor || "#000000"}
              strokeWidth={(element.style?.strokeWidth || 1) / (scale || 1)}
            />
            <Line
              points={[0, -height / 2, 0, height / 2]}
              stroke={element.style?.strokeColor || "#000000"}
              strokeWidth={(element.style?.strokeWidth || 1) / (scale || 1)}
            />
          </>
        );
      case "sliding":
        return (
          <>
            <Line
              points={[0, -height / 2, 0, height / 2]}
              stroke={element.style?.strokeColor || "#000000"}
              strokeWidth={(element.style?.strokeWidth || 1) / (scale || 1)}
            />
            <Line
              points={[-width / 4, -height / 2, -width / 4, height / 2]}
              stroke={element.style?.strokeColor || "#000000"}
              strokeWidth={(element.style?.strokeWidth || 0.5) / (scale || 1)}
              dash={[5 / (scale || 1), 2 / (scale || 1)]}
            />
          </>
        );
      case "single":
      default:
        return (
          <Line
            points={[0, -height / 2, 0, height / 2]}
            stroke={element.style?.strokeColor || "#000000"}
            strokeWidth={(element.style?.strokeWidth || 1) / (scale || 1)}
          />
        );
    }
  };

  return (
    <Group
      x={windowProps.x}
      y={windowProps.y}
      rotation={windowProps.rotation}
      draggable={!element.metadata?.locked}
      onDragEnd={handleDragEnd}
    >
      {/* Window frame */}
      <Rect
        id={element._id}
        x={-windowProps.width / 2}
        y={-windowProps.height / 2}
        width={windowProps.width}
        height={windowProps.height}
        fill={element.style?.fillColor || "#b3e0ff"}
        stroke={element.style?.strokeColor || "#000000"}
        strokeWidth={(element.style?.strokeWidth || 1) / (scale || 1)}
        opacity={element.style?.opacity || 1}
        perfectDrawEnabled={false}
      />

      {/* Window panes */}
      {renderWindowPanes()}

      {/* Selection indicator */}
      {isSelected && (
        <Rect
          x={-windowProps.width / 2 - 5 / (scale || 1)}
          y={-windowProps.height / 2 - 5 / (scale || 1)}
          width={windowProps.width + 10 / (scale || 1)}
          height={windowProps.height + 10 / (scale || 1)}
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

export default Window;
