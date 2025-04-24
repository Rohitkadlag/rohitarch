// src/components/drawing/Layers.jsx
import React, { useState, useEffect } from "react";

const Layers = ({
  elements,
  selectedElements,
  onSelectionChange,
  onUpdate,
}) => {
  const [layers, setLayers] = useState([]);
  const [expandedLayers, setExpandedLayers] = useState({});
  const [newLayerName, setNewLayerName] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeLayer, setActiveLayer] = useState(null);

  // Extract unique layers from elements and organize them
  useEffect(() => {
    if (!elements) return;

    // Get unique layer names
    const layerNames = [
      ...new Set(elements.map((el) => el.metadata?.layer || "default")),
    ];

    // Initialize expanded state for new layers
    layerNames.forEach((layerName) => {
      if (expandedLayers[layerName] === undefined) {
        setExpandedLayers((prev) => ({
          ...prev,
          [layerName]: true,
        }));
      }
    });

    // Create layer objects with their elements
    const layerObjects = layerNames.map((layerName) => {
      const layerElements = elements.filter(
        (el) => (el.metadata?.layer || "default") === layerName
      );
      return {
        name: layerName,
        elements: layerElements,
        visible: layerElements.some((el) => el.metadata?.visible !== false), // Layer is visible if any element is visible
        locked: layerElements.every((el) => el.metadata?.locked === true), // Layer is locked if all elements are locked
      };
    });

    // Sort layers (default layer first, then alphabetically)
    layerObjects.sort((a, b) => {
      if (a.name === "default") return -1;
      if (b.name === "default") return 1;
      return a.name.localeCompare(b.name);
    });

    setLayers(layerObjects);
  }, [elements, expandedLayers]);

  // Toggle layer expansion
  const toggleLayer = (layerName) => {
    setExpandedLayers((prev) => ({
      ...prev,
      [layerName]: !prev[layerName],
    }));
  };

  // Toggle element selection
  const toggleElementSelection = (element) => {
    const isSelected = selectedElements.some((el) => el._id === element._id);

    if (isSelected) {
      onSelectionChange(
        selectedElements.filter((el) => el._id !== element._id)
      );
    } else {
      onSelectionChange([...selectedElements, element]);
    }
  };

  // Toggle layer visibility
  const toggleLayerVisibility = (layerName) => {
    // Get all elements in this layer
    const layerElements = elements.filter(
      (el) => (el.metadata?.layer || "default") === layerName
    );
    const currentVisibility = layers.find((l) => l.name === layerName)?.visible;

    // Update all elements in the layer
    layerElements.forEach((element) => {
      const updatedElement = {
        ...element,
        metadata: {
          ...element.metadata,
          visible: !currentVisibility,
        },
      };

      onUpdate(element._id, updatedElement);
    });
  };

  // Toggle layer lock
  const toggleLayerLock = (layerName) => {
    // Get all elements in this layer
    const layerElements = elements.filter(
      (el) => (el.metadata?.layer || "default") === layerName
    );
    const currentLock = layers.find((l) => l.name === layerName)?.locked;

    // Update all elements in the layer
    layerElements.forEach((element) => {
      const updatedElement = {
        ...element,
        metadata: {
          ...element.metadata,
          locked: !currentLock,
        },
      };

      onUpdate(element._id, updatedElement);
    });
  };

  // Toggle element visibility
  const toggleElementVisibility = (e, element) => {
    e.stopPropagation();

    const updatedElement = {
      ...element,
      metadata: {
        ...element.metadata,
        visible: element.metadata?.visible === false ? true : false,
      },
    };

    onUpdate(element._id, updatedElement);
  };

  // Toggle element lock
  const toggleElementLock = (e, element) => {
    e.stopPropagation();

    const updatedElement = {
      ...element,
      metadata: {
        ...element.metadata,
        locked: !element.metadata?.locked,
      },
    };

    onUpdate(element._id, updatedElement);
  };

  // Create a new layer
  const handleCreateLayer = () => {
    if (!newLayerName.trim()) return;

    // Check if layer already exists
    if (layers.some((l) => l.name === newLayerName)) {
      alert(`Layer "${newLayerName}" already exists`);
      return;
    }

    // Create a new empty layer
    setExpandedLayers((prev) => ({
      ...prev,
      [newLayerName]: true,
    }));

    setNewLayerName("");
  };

  // Move selected elements to a different layer
  const moveSelectedElementsToLayer = (targetLayer) => {
    selectedElements.forEach((element) => {
      const updatedElement = {
        ...element,
        metadata: {
          ...element.metadata,
          layer: targetLayer,
        },
      };

      onUpdate(element._id, updatedElement);
    });

    setActiveLayer(null);
  };

  // Open context menu for a layer
  const handleLayerMenuOpen = (e, layerName) => {
    e.preventDefault();
    setActiveLayer(layerName);
    setMenuAnchor({ x: e.clientX, y: e.clientY });
  };

  // Close context menu
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setActiveLayer(null);
  };

  // Delete layer and move elements to default
  const handleDeleteLayer = () => {
    if (activeLayer === "default") {
      alert("Cannot delete the default layer");
      handleMenuClose();
      return;
    }

    // Move all elements in this layer to default
    const layerElements = elements.filter(
      (el) => (el.metadata?.layer || "default") === activeLayer
    );

    layerElements.forEach((element) => {
      const updatedElement = {
        ...element,
        metadata: {
          ...element.metadata,
          layer: "default",
        },
      };

      onUpdate(element._id, updatedElement);
    });

    handleMenuClose();
  };

  // Rename layer
  const handleRenameLayer = () => {
    const newName = prompt("Enter new layer name", activeLayer);

    if (!newName || newName === activeLayer) {
      handleMenuClose();
      return;
    }

    // Check if layer name already exists
    if (layers.some((l) => l.name === newName)) {
      alert(`Layer "${newName}" already exists`);
      handleMenuClose();
      return;
    }

    // Update all elements in this layer
    const layerElements = elements.filter(
      (el) => (el.metadata?.layer || "default") === activeLayer
    );

    layerElements.forEach((element) => {
      const updatedElement = {
        ...element,
        metadata: {
          ...element.metadata,
          layer: newName,
        },
      };

      onUpdate(element._id, updatedElement);
    });

    // Update expanded layers state
    setExpandedLayers((prev) => {
      const { [activeLayer]: oldValue, ...rest } = prev;
      return {
        ...rest,
        [newName]: oldValue,
      };
    });

    handleMenuClose();
  };

  return (
    <div className="p-4">
      {/* Layer management controls */}
      <div className="flex items-center mb-4">
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="New Layer Name"
          value={newLayerName}
          onChange={(e) => setNewLayerName(e.target.value)}
        />
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={handleCreateLayer}
          disabled={!newLayerName.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Layer list */}
      <div className="space-y-2">
        {layers.map((layer) => (
          <div
            key={layer.name}
            className="bg-white rounded-md shadow-sm overflow-hidden"
          >
            <div
              className="px-4 py-3 cursor-pointer flex items-center justify-between border-b border-gray-200 hover:bg-gray-50"
              onClick={() => toggleLayer(layer.name)}
              onContextMenu={(e) => handleLayerMenuOpen(e, layer.name)}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 mr-2 transform transition-transform ${
                    expandedLayers[layer.name] ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{layer.name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({layer.elements.length})
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  className={`p-1 rounded-full ${
                    layer.visible
                      ? "text-blue-600 hover:bg-blue-100"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(layer.name);
                  }}
                  title={layer.visible ? "Hide Layer" : "Show Layer"}
                >
                  {layer.visible ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
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
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>

                <button
                  className={`p-1 rounded-full ${
                    layer.locked
                      ? "text-blue-600 hover:bg-blue-100"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerLock(layer.name);
                  }}
                  title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                >
                  {layer.locked ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
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
                      <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                    </svg>
                  )}
                </button>

                <button
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLayerMenuOpen(e, layer.name);
                  }}
                  title="Layer Options"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>

            {expandedLayers[layer.name] && (
              <div className="px-2 py-1 max-h-60 overflow-y-auto bg-gray-50">
                {layer.elements.length === 0 ? (
                  <div className="px-2 py-3 text-center text-sm text-gray-500">
                    No elements in this layer
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {layer.elements.map((element) => {
                      const isSelected = selectedElements.some(
                        (sel) => sel._id === element._id
                      );
                      const isVisible = element.metadata?.visible !== false;
                      const isLocked = element.metadata?.locked === true;

                      return (
                        <div
                          key={element._id}
                          className={`flex items-center justify-between px-2 py-2 cursor-pointer ${
                            isSelected ? "bg-blue-50" : "hover:bg-gray-100"
                          }`}
                          onClick={() => toggleElementSelection(element)}
                        >
                          <div className="flex items-center">
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${
                                isSelected ? "bg-blue-500" : "bg-gray-300"
                              }`}
                            ></span>
                            <span
                              className={`text-sm ${
                                isVisible ? "" : "text-gray-400"
                              }`}
                            >
                              {element.metadata?.name ||
                                `${element.type} ${element._id.substring(
                                  0,
                                  4
                                )}`}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              className={`p-1 rounded-full ${
                                isVisible
                                  ? "text-blue-600 hover:bg-blue-100"
                                  : "text-gray-400 hover:bg-gray-100"
                              }`}
                              onClick={(e) =>
                                toggleElementVisibility(e, element)
                              }
                              title={
                                isVisible ? "Hide Element" : "Show Element"
                              }
                            >
                              {isVisible ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                    clipRule="evenodd"
                                  />
                                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                              )}
                            </button>

                            <button
                              className={`p-1 rounded-full ${
                                isLocked
                                  ? "text-blue-600 hover:bg-blue-100"
                                  : "text-gray-400 hover:bg-gray-100"
                              }`}
                              onClick={(e) => toggleElementLock(e, element)}
                              title={
                                isLocked ? "Unlock Element" : "Lock Element"
                              }
                            >
                              {isLocked ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Layer context menu */}
      {menuAnchor && (
        <div
          className="fixed bg-white rounded-md shadow-lg z-50 w-56"
          style={{ top: menuAnchor.y, left: menuAnchor.x }}
        >
          <div className="py-1">
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={handleRenameLayer}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-3 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Rename Layer
            </button>

            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={handleDeleteLayer}
              disabled={activeLayer === "default"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-3 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Delete Layer
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            <div className="px-4 py-2 text-sm text-gray-500">
              Move Selected Elements to:
            </div>

            {layers.map((layer) => (
              <button
                key={layer.name}
                className={`w-full text-left px-4 py-2 text-sm ${
                  activeLayer === layer.name
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => moveSelectedElementsToLayer(layer.name)}
                disabled={
                  layer.name === activeLayer || selectedElements.length === 0
                }
              >
                <div className="pl-7">{layer.name}</div>
              </button>
            ))}
          </div>

          {/* Overlay to capture clicks outside the menu */}
          <div className="fixed inset-0 z-40" onClick={handleMenuClose}></div>
        </div>
      )}

      {/* Selected elements count */}
      <div className="mt-4 p-2 bg-gray-100 rounded text-sm text-gray-600">
        {selectedElements.length === 0
          ? "No elements selected"
          : `${selectedElements.length} element${
              selectedElements.length > 1 ? "s" : ""
            } selected`}
      </div>
    </div>
  );
};

export default Layers;
