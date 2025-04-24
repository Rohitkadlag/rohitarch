// src/components/drawing/elements/Text.jsx
import React, { useState, useEffect, useRef } from "react";
import { Group, Text as KonvaText, Transformer, Rect } from "react-konva";

const Text = ({ element, isSelected, onDragEnd, scale }) => {
  const [textProps, setTextProps] = useState({
    x: 0,
    y: 0,
    text: "Text label",
    fontSize: 16,
    fontFamily: "Arial",
    width: 150,
    rotation: 0,
  });

  const textRef = useRef();
  const trRef = useRef();

  // Update text properties when element changes
  useEffect(() => {
    if (element && element.geometry) {
      // Extract text position from the first point
      const position = element.geometry.points?.[0] || { x: 0, y: 0 };

      setTextProps({
        x: position.x,
        y: position.y,
        text: element.geometry.content || "Text label",
        fontSize: element.geometry.fontSize || 16,
        fontFamily: element.geometry.fontFamily || "Arial",
        width: element.geometry.width || 150,
        rotation: element.geometry.rotation || 0,
      });
    }
  }, [element]);

  // Attach transformer when selected
  useEffect(() => {
    if (isSelected && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Handle text drag
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
        rotation: textProps.rotation,
      },
    };

    onDragEnd(element._id, updatedElement);
  };

  // Handle transform end (resize/rotate)
  const handleTransformEnd = () => {
    if (!onDragEnd || !textRef.current) return;

    // Get new position and dimension properties
    const node = textRef.current;
    const rotation = node.rotation();

    const newPosition = {
      x: node.x(),
      y: node.y(),
    };

    const width = node.width() * node.scaleX();

    const updatedElement = {
      ...element,
      geometry: {
        ...element.geometry,
        points: [newPosition],
        width: width,
        rotation: rotation,
      },
    };

    // Reset scale to avoid accumulating transforms
    node.scaleX(1);
    node.scaleY(1);
    node.width(width);

    // Update local state
    setTextProps({
      ...textProps,
      width: width,
      rotation: rotation,
    });

    onDragEnd(element._id, updatedElement);
  };

  return (
    <Group>
      <KonvaText
        id={element._id}
        ref={textRef}
        x={textProps.x}
        y={textProps.y}
        text={textProps.text}
        fontSize={textProps.fontSize / (scale || 1)}
        fontFamily={textProps.fontFamily}
        fill={element.style?.strokeColor || "#000000"}
        width={textProps.width}
        draggable={!element.metadata?.locked}
        rotation={textProps.rotation}
        opacity={element.style?.opacity || 1}
        onDragEnd={handleDragEnd}
      />

      {/* Selection indicator */}
      {isSelected && !element.metadata?.locked && (
        <Transformer
          ref={trRef}
          enabledAnchors={["middle-left", "middle-right"]}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit min width
            if (newBox.width < 10) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          onTransformEnd={handleTransformEnd}
          anchorSize={8 / (scale || 1)}
          anchorCornerRadius={2 / (scale || 1)}
          borderStroke="#3b82f6"
          borderStrokeWidth={1 / (scale || 1)}
          borderDash={[5 / (scale || 1), 5 / (scale || 1)]}
        />
      )}
    </Group>
  );
};

export default Text;
