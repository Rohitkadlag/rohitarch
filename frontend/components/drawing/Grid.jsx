// src/components/drawing/Grid.jsx
import React from "react";
import { Line, Group } from "react-konva";

const Grid = ({ width, height, cellSize, strokeWidth }) => {
  // Generate vertical lines
  const createVerticalLines = () => {
    const lines = [];
    const numLines = Math.ceil(width / cellSize) + 1;

    for (let i = 0; i < numLines; i++) {
      const x = i * cellSize;
      lines.push(
        <Line
          key={`v-${i}`}
          points={[x, 0, x, height]}
          stroke={i % 5 === 0 ? "#a0aec0" : "#e2e8f0"}
          strokeWidth={i % 5 === 0 ? strokeWidth * 1.5 : strokeWidth}
          listening={false}
          perfectDrawEnabled={false}
        />
      );
    }

    return lines;
  };

  // Generate horizontal lines
  const createHorizontalLines = () => {
    const lines = [];
    const numLines = Math.ceil(height / cellSize) + 1;

    for (let i = 0; i < numLines; i++) {
      const y = i * cellSize;
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, y, width, y]}
          stroke={i % 5 === 0 ? "#a0aec0" : "#e2e8f0"}
          strokeWidth={i % 5 === 0 ? strokeWidth * 1.5 : strokeWidth}
          listening={false}
          perfectDrawEnabled={false}
        />
      );
    }

    return lines;
  };

  // Create major grid lines (coordinate axes)
  const createAxes = () => {
    return (
      <>
        <Line
          points={[0, -height, 0, height * 2]}
          stroke="#4a5568"
          strokeWidth={strokeWidth * 2}
          listening={false}
          perfectDrawEnabled={false}
        />
        <Line
          points={[-width, 0, width * 2, 0]}
          stroke="#4a5568"
          strokeWidth={strokeWidth * 2}
          listening={false}
          perfectDrawEnabled={false}
        />
      </>
    );
  };

  return (
    <Group>
      {createVerticalLines()}
      {createHorizontalLines()}
      {createAxes()}
    </Group>
  );
};

export default Grid;
