// src/components/drawing/DrawingEditor.jsx
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Stage, Layer, Group } from "react-konva";
import { getDrawing, updateDrawing } from "../../src/actions/drawing";
import {
  getElements,
  createElement,
  updateElement,
  deleteElement,
  batchUpdateElements,
} from "../../src/actions/element";

import Grid from "./Grid";
import Properties from "./Properties";
import Layers from "./Layers";
import Wall from "./elements/Wall";
import Door from "./elements/Door";
import Window from "./elements/Window";
import Room from "./elements/Room";
import Furniture from "./elements/Furniture";
import Text from "./elements/Text";
import Dimension from "./elements/Dimension";

const DrawingEditor = () => {
  const dispatch = useDispatch();
  const { drawingId } = useParams();
  const stageRef = useRef(null);

  // Redux state
  const { drawing, loading: drawingLoading } = useSelector(
    (state) => state.drawing
  );
  const { elements, loading: elementsLoading } = useSelector(
    (state) => state.element
  );

  // Local state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth - 300,
    height: window.innerHeight - 100,
  });
  const [selectedElements, setSelectedElements] = useState([]);
  const [activeTool, setActiveTool] = useState("select");
  const [isDrawing, setIsDrawing] = useState(false);
  const [newElement, setNewElement] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState("properties");
  const [gridSnap, setGridSnap] = useState(true);
  const [gridSize, setGridSize] = useState(50);

  // Component did mount
  useEffect(() => {
    if (drawingId) {
      dispatch(getDrawing(drawingId));
      dispatch(getElements(drawingId));
    }

    // Handle window resize
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth - (rightPanelOpen ? 300 : 0),
        height: window.innerHeight - 100,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch, drawingId, rightPanelOpen]);

  // Handle drawing loaded
  useEffect(() => {
    if (drawing && drawing.viewBox) {
      setScale(drawing.scale || 1);
      setPosition({
        x: drawing.viewBox.x || 0,
        y: drawing.viewBox.y || 0,
      });

      if (drawing.gridSettings) {
        setGridSnap(drawing.gridSettings.snap);
        setGridSize(drawing.gridSettings.size);
      }
    }
  }, [drawing]);

  // Save drawing state to history when elements change
  useEffect(() => {
    if (!elementsLoading && elements.length > 0) {
      // Only add to history if elements actually changed
      if (
        history.length === 0 ||
        JSON.stringify(history[historyStep]) !== JSON.stringify(elements)
      ) {
        // Truncate history if we're not at the end
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push([...elements]);

        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
      }
    }
  }, [elements, elementsLoading, history, historyStep]);

  // Canvas event handlers
  const handleWheel = (e) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    const oldScale = scale;

    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // Calculate new scale
    const newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;
    setScale(newScale);

    // Calculate new position
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setPosition(newPos);
  };

  const handleStageClick = (e) => {
    // Clicked on empty area
    if (e.target === e.target.getStage()) {
      setSelectedElements([]);
      return;
    }

    // Handle tool clicks
    switch (activeTool) {
      case "select":
        const clickedId = e.target.id();
        if (clickedId) {
          const element = elements.find((el) => el._id === clickedId);
          if (element) {
            // Toggle selection if holding shift
            if (e.evt.shiftKey) {
              const isSelected = selectedElements.some(
                (el) => el._id === clickedId
              );
              if (isSelected) {
                setSelectedElements(
                  selectedElements.filter((el) => el._id !== clickedId)
                );
              } else {
                setSelectedElements([...selectedElements, element]);
              }
            } else {
              setSelectedElements([element]);
            }
          }
        }
        break;
      case "wall":
        if (!isDrawing) {
          // Start drawing wall
          const point = getSnappedPoint({
            x: (e.evt.offsetX - position.x) / scale,
            y: (e.evt.offsetY - position.y) / scale,
          });

          const newWall = {
            type: "wall",
            drawing: drawingId,
            geometry: {
              points: [point, point],
            },
            style: {
              strokeColor: "#000000",
              strokeWidth: 10,
              fillColor: "#cccccc",
            },
            metadata: {
              name: `Wall ${
                elements.filter((el) => el.type === "wall").length + 1
              }`,
              layer: "walls",
            },
          };

          setNewElement(newWall);
          setIsDrawing(true);
        } else {
          // Finish drawing wall
          const point = getSnappedPoint({
            x: (e.evt.offsetX - position.x) / scale,
            y: (e.evt.offsetY - position.y) / scale,
          });

          const updatedWall = {
            ...newElement,
            geometry: {
              ...newElement.geometry,
              points: [...newElement.geometry.points.slice(0, -1), point],
            },
          };

          // Add point if double-click
          if (e.evt.detail === 2) {
            setIsDrawing(false);
            dispatch(createElement(updatedWall));
            setNewElement(null);
          } else {
            // Continue drawing by adding a new point
            setNewElement({
              ...updatedWall,
              geometry: {
                ...updatedWall.geometry,
                points: [...updatedWall.geometry.points, point],
              },
            });
          }
        }
        break;
      // Handle other tools...
      default:
        break;
    }
  };

  const handleStageMouseMove = (e) => {
    if (isDrawing && newElement) {
      const point = getSnappedPoint({
        x: (e.evt.offsetX - position.x) / scale,
        y: (e.evt.offsetY - position.y) / scale,
      });

      // Update last point of the element being drawn
      const points = [...newElement.geometry.points];
      points[points.length - 1] = point;

      setNewElement({
        ...newElement,
        geometry: {
          ...newElement.geometry,
          points,
        },
      });
    }
  };

  const handleElementDragEnd = (id, newPos) => {
    const element = elements.find((el) => el._id === id);
    if (!element) return;

    // Calculate position difference
    const dx = newPos.x - element.geometry.points[0].x;
    const dy = newPos.y - element.geometry.points[0].y;

    // Move all points
    const updatedPoints = element.geometry.points.map((point) => ({
      x: point.x + dx,
      y: point.y + dy,
    }));

    const updatedElement = {
      ...element,
      geometry: {
        ...element.geometry,
        points: updatedPoints,
      },
    };

    dispatch(updateElement(id, updatedElement));
  };

  // Helper functions
  const getSnappedPoint = (point) => {
    if (!gridSnap) return point;

    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
    };
  };

  const handleToolChange = (tool) => {
    setActiveTool(tool);

    // Cancel drawing if changing tools
    if (isDrawing) {
      setIsDrawing(false);
      setNewElement(null);
    }
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      dispatch(batchUpdateElements(drawingId, history[newStep]));
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      dispatch(batchUpdateElements(drawingId, history[newStep]));
    }
  };

  const handleSave = () => {
    // Save current viewBox and scale
    const updatedDrawing = {
      ...drawing,
      viewBox: {
        x: position.x,
        y: position.y,
        width: stageSize.width,
        height: stageSize.height,
      },
      scale,
      gridSettings: {
        enabled: true,
        size: gridSize,
        snap: gridSnap,
      },
    };

    dispatch(updateDrawing(drawingId, updatedDrawing));
  };

  const handleZoomIn = () => {
    const newScale = scale * 1.2;
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = scale / 1.2;
    setScale(newScale);
  };

  const handleGridToggle = () => {
    setGridSnap(!gridSnap);
  };

  const toggleRightPanel = () => {
    setRightPanelOpen(!rightPanelOpen);
    setStageSize({
      width: window.innerWidth - (!rightPanelOpen ? 300 : 0),
      height: window.innerHeight - 100,
    });
  };

  // Render elements based on their type
  const renderElements = () => {
    if (elementsLoading || !elements) return null;

    return elements.map((element) => {
      const isSelected = selectedElements.some(
        (sel) => sel._id === element._id
      );

      switch (element.type) {
        case "wall":
          return (
            <Wall
              key={element._id}
              element={element}
              isSelected={isSelected}
              onDragEnd={handleElementDragEnd}
              scale={scale}
            />
          );
        case "door":
          return (
            <Door
              key={element._id}
              element={element}
              isSelected={isSelected}
              onDragEnd={handleElementDragEnd}
              scale={scale}
            />
          );
        case "window":
          return (
            <Window
              key={element._id}
              element={element}
              isSelected={isSelected}
              onDragEnd={handleElementDragEnd}
              scale={scale}
            />
          );
        case "room":
          return (
            <Room
              key={element._id}
              element={element}
              isSelected={isSelected}
              onDragEnd={handleElementDragEnd}
              scale={scale}
            />
          );
        case "furniture":
          return (
            <Furniture
              key={element._id}
              element={element}
              isSelected={isSelected}
              onDragEnd={handleElementDragEnd}
              scale={scale}
            />
          );
        case "text":
          return (
            <Text
              key={element._id}
              element={element}
              isSelected={isSelected}
              onDragEnd={handleElementDragEnd}
              scale={scale}
            />
          );
        case "dimension":
          return (
            <Dimension
              key={element._id}
              element={element}
              isSelected={isSelected}
              onDragEnd={handleElementDragEnd}
              scale={scale}
            />
          );
        default:
          return null;
      }
    });
  };

  // Render currently drawing element
  const renderDrawingElement = () => {
    if (!isDrawing || !newElement) return null;

    switch (newElement.type) {
      case "wall":
        return (
          <Wall
            element={newElement}
            isSelected={false}
            isDrawing={true}
            scale={scale}
          />
        );
      // Other element types...
      default:
        return null;
    }
  };

  // Loading state
  if (drawingLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top toolbar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 mr-8">
              {drawing ? drawing.title : "Drawing Editor"}
            </h1>

            <button
              onClick={handleSave}
              className="mr-2 p-2 rounded-md hover:bg-gray-100"
              title="Save"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
              </svg>
            </button>

            <button
              onClick={handleUndo}
              disabled={historyStep === 0}
              className={`mr-2 p-2 rounded-md ${
                historyStep === 0 ? "text-gray-300" : "hover:bg-gray-100"
              }`}
              title="Undo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              onClick={handleRedo}
              disabled={historyStep >= history.length - 1}
              className={`mr-2 p-2 rounded-md ${
                historyStep >= history.length - 1
                  ? "text-gray-300"
                  : "hover:bg-gray-100"
              }`}
              title="Redo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleZoomIn}
              className="mr-2 p-2 rounded-md hover:bg-gray-100"
              title="Zoom In"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              onClick={handleZoomOut}
              className="mr-2 p-2 rounded-md hover:bg-gray-100"
              title="Zoom Out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              onClick={handleGridToggle}
              className={`mr-2 p-2 rounded-md ${
                gridSnap ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
              }`}
              title={gridSnap ? "Grid Snap On" : "Grid Snap Off"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h2v2H5V5zm0 4h2v2H5V9zm0 4h2v2H5v-2zm4-8h2v2H9V5zm0 4h2v2H9V9zm0 4h2v2H9v-2zm4-8h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main content area with drawing canvas and sidebars */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar with tools */}
        <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4">
          <button
            onClick={() => handleToolChange("select")}
            className={`p-3 mb-2 rounded-md ${
              activeTool === "select"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
            }`}
            title="Select Tool"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
          </button>

          <button
            onClick={() => handleToolChange("wall")}
            className={`p-3 mb-2 rounded-md ${
              activeTool === "wall"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
            }`}
            title="Wall Tool"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            </svg>
          </button>

          <button
            onClick={() => handleToolChange("door")}
            className={`p-3 mb-2 rounded-md ${
              activeTool === "door"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
            }`}
            title="Door Tool"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 3v3a2 2 0 002 2h2a2 2 0 002-2V3m-6 8a2 2 0 002 2h2a2 2 0 002-2m-6 2v-2m6 2v-2M4 15v5a2 2 0 002 2h12a2 2 0 002-2v-5M2 10h20"
              />
            </svg>
          </button>

          <button
            onClick={() => handleToolChange("window")}
            className={`p-3 mb-2 rounded-md ${
              activeTool === "window"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
            }`}
            title="Window Tool"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>

          <button
            onClick={() => handleToolChange("room")}
            className={`p-3 mb-2 rounded-md ${
              activeTool === "room"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
            }`}
            title="Room Tool"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </button>

          <button
            onClick={() => handleToolChange("furniture")}
            className={`p-3 mb-2 rounded-md ${
              activeTool === "furniture"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
            }`}
            title="Furniture Tool"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </button>

          <button
            onClick={() => handleToolChange("text")}
            className={`p-3 mb-2 rounded-md ${
              activeTool === "text"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
            }`}
            title="Text Tool"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </button>

          <button
            onClick={() => handleToolChange("dimension")}
            className={`p-3 mb-2 rounded-md ${
              activeTool === "dimension"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
            }`}
            title="Dimension Tool"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        {/* Main canvas area */}
        <div className="flex-1 relative bg-gray-50 overflow-hidden">
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            onWheel={handleWheel}
            onClick={handleStageClick}
            onMouseMove={handleStageMouseMove}
            ref={stageRef}
            x={position.x}
            y={position.y}
            scaleX={scale}
            scaleY={scale}
          >
            {/* Grid Layer */}
            <Layer>
              <Grid
                width={5000}
                height={5000}
                cellSize={gridSize}
                strokeWidth={1 / scale}
              />
            </Layer>

            {/* Main drawing layer */}
            <Layer>
              {renderElements()}
              {renderDrawingElement()}
            </Layer>
          </Stage>

          {/* Status bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 border-t border-gray-200 px-4 py-1 text-sm text-gray-600 flex justify-between">
            <div>Scale: {Math.round(scale * 100)}%</div>
            <div>
              Grid: {gridSize}px {gridSnap ? "(Snap On)" : "(Snap Off)"}
            </div>
            <div>Selected: {selectedElements.length} elements</div>
          </div>
        </div>

        {/* Right sidebar with properties and layers */}
        {rightPanelOpen && (
          <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  className={`px-4 py-3 text-sm font-medium ${
                    rightPanelTab === "properties"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setRightPanelTab("properties")}
                >
                  Properties
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium ${
                    rightPanelTab === "layers"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setRightPanelTab("layers")}
                >
                  Layers
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {rightPanelTab === "properties" && (
                <Properties
                  selectedElements={selectedElements}
                  onUpdate={(id, updatedElement) => {
                    dispatch(updateElement(id, updatedElement));
                  }}
                  onDelete={(id) => {
                    dispatch(deleteElement(id));
                    setSelectedElements(
                      selectedElements.filter((el) => el._id !== id)
                    );
                  }}
                />
              )}

              {rightPanelTab === "layers" && (
                <Layers
                  elements={elements}
                  selectedElements={selectedElements}
                  onSelectionChange={setSelectedElements}
                  onUpdate={(id, updatedElement) => {
                    dispatch(updateElement(id, updatedElement));
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Toggle panel button */}
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-l-md p-1 z-10"
          onClick={toggleRightPanel}
        >
          {rightPanelOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default DrawingEditor;
