// src/components/drawing/elements/Furniture.jsx
import React, { useState, useEffect } from "react";
import { Group, Rect, Path, Text, Transformer } from "react-konva";

const Furniture = ({ element, isSelected, onDragEnd, scale }) => {
  const [furnitureProps, setFurnitureProps] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 60,
    rotation: 0,
    type: "table", // 'table', 'chair', 'bed', 'sofa', etc.
  });

  const [shapeData, setShapeData] = useState(null);
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  // Update furniture properties when element changes
  useEffect(() => {
    if (element && element.geometry) {
      // Extract furniture position from the first point
      const position = element.geometry.points?.[0] || { x: 0, y: 0 };

      setFurnitureProps({
        x: position.x,
        y: position.y,
        width: element.geometry.width || 100,
        height: element.geometry.height || 60,
        rotation: element.geometry.rotation || 0,
        type: element.geometry.shape || "table",
      });
    }
  }, [element]);

  // Attach transformer when selected
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Generate furniture shape based on type
  useEffect(() => {
    const { type, width, height } = furnitureProps;

    switch (type) {
      case "chair":
        setShapeData({
          path: `M 0,0 
                 L ${width},0 
                 L ${width},${height} 
                 L 0,${height} 
                 L 0,0 
                 M ${width * 0.2},${height * 0.2} 
                 L ${width * 0.8},${height * 0.2} 
                 L ${width * 0.8},${height * 0.8} 
                 L ${width * 0.2},${height * 0.8} 
                 L ${width * 0.2},${height * 0.2}`,
          label: "Chair",
        });
        break;
      case "bed":
        setShapeData({
          path: `M 0,0 
                 L ${width},0 
                 L ${width},${height} 
                 L 0,${height} 
                 L 0,0 
                 M 0,${height * 0.3} 
                 L ${width},${height * 0.3}`,
          label: "Bed",
        });
        break;
      case "sofa":
        setShapeData({
          path: `M 0,0 
                 L ${width},0 
                 L ${width},${height} 
                 L 0,${height} 
                 L 0,0 
                 M 0,${height * 0.3} 
                 L ${width},${height * 0.3} 
                 M ${width * 0.1},0 
                 A ${width * 0.1},${height * 0.2} 0 0,1 ${width * 0.1},${
            height * 0.3
          } 
                 M ${width * 0.9},0 
                 A ${width * 0.1},${height * 0.2} 0 0,0 ${width * 0.9},${
            height * 0.3
          }`,
          label: "Sofa",
        });
        break;
      case "table":
      default:
        setShapeData({
          path: `M 0,0 
                 L ${width},0 
                 L ${width},${height} 
                 L 0,${height} 
                 L 0,0`,
          label: "Table",
        });
        break;
    }
  }, [furnitureProps]);

  // Handle furniture drag
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
        width: furnitureProps.width,
        height: furnitureProps.height,
        rotation: furnitureProps.rotation,
      },
    };

    onDragEnd(element._id, updatedElement);
  };

  // Handle transform end (resize/rotate)
  const handleTransformEnd = () => {
    if (!onDragEnd || !shapeRef.current) return;

    // Get new position and dimension properties
    const node = shapeRef.current;
    const rotation = node.rotation();

    const newPosition = {
      x: node.x(),
      y: node.y(),
    };

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const updatedElement = {
      ...element,
      geometry: {
        ...element.geometry,
        points: [newPosition],
        width: furnitureProps.width * scaleX,
        height: furnitureProps.height * scaleY,
        rotation: rotation,
      },
    };

    // Reset scale to avoid accumulating transforms
    node.scaleX(1);
    node.scaleY(1);

    // Update local state
    setFurnitureProps({
      ...furnitureProps,
      width: furnitureProps.width * scaleX,
      height: furnitureProps.height * scaleY,
      rotation: rotation,
    });

    onDragEnd(element._id, updatedElement);
  };

  if (!shapeData) return null;

  return (
    <Group>
      <Group
        id={element._id}
        x={furnitureProps.x}
        y={furnitureProps.y}
        rotation={furnitureProps.rotation}
        draggable={!element.metadata?.locked}
        onDragEnd={handleDragEnd}
        ref={shapeRef}
      >
        {/* Furniture shape */}
        <Path
          data={shapeData.path}
          fill={element.style?.fillColor || "#f8f9fa"}
          stroke={element.style?.strokeColor || "#000000"}
          strokeWidth={(element.style?.strokeWidth || 1) / (scale || 1)}
          opacity={element.style?.opacity || 1}
          perfectDrawEnabled={false}
        />

        {/* Furniture label */}
        <Text
          x={0}
          y={furnitureProps.height / 2 - 15 / (scale || 1)}
          width={furnitureProps.width}
          text={element.metadata?.name || shapeData.label}
          fontSize={12 / (scale || 1)}
          fill="#000000"
          align="center"
          listening={false}
        />
      </Group>

      {/* Transformer for resizing/rotating */}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit min size
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          keepRatio={false}
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

export default Furniture;
