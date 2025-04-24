// src/components/drawing/Properties.jsx
import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";

const Properties = ({ selectedElements, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState({
    general: true,
    geometry: true,
    style: true,
    metadata: false,
  });

  const [formValues, setFormValues] = useState({
    // General
    name: "",
    type: "",

    // Style
    strokeColor: "#000000",
    strokeWidth: 1,
    fillColor: "transparent",
    opacity: 1,

    // Metadata
    layer: "default",
    locked: false,
    visible: true,
    zIndex: 0,
  });

  const [colorPickerOpen, setColorPickerOpen] = useState({
    stroke: false,
    fill: false,
  });

  // Update form values when selected elements change
  useEffect(() => {
    if (selectedElements.length === 1) {
      const element = selectedElements[0];

      setFormValues({
        // General
        name: element.metadata?.name || "",
        type: element.type || "",

        // Style
        strokeColor: element.style?.strokeColor || "#000000",
        strokeWidth: element.style?.strokeWidth || 1,
        fillColor: element.style?.fillColor || "transparent",
        opacity: element.style?.opacity || 1,

        // Metadata
        layer: element.metadata?.layer || "default",
        locked: element.metadata?.locked || false,
        visible: element.metadata?.visible !== false, // Default to true
        zIndex: element.metadata?.zIndex || 0,
      });
    } else {
      // Multiple elements selected or none
      setFormValues({
        name:
          selectedElements.length > 1
            ? `${selectedElements.length} elements selected`
            : "",
        type: "",
        strokeColor: "#000000",
        strokeWidth: 1,
        fillColor: "transparent",
        opacity: 1,
        layer: "default",
        locked: false,
        visible: true,
        zIndex: 0,
      });
    }
  }, [selectedElements]);

  // Toggle section expand/collapse
  const toggleSection = (section) => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section],
    });
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseFloat(value)
          : value,
    });
  };

  // Handle color change
  const handleColorChange = (colorType, color) => {
    setFormValues({
      ...formValues,
      [colorType]: color.hex,
    });
  };

  // Apply changes to the selected element(s)
  const applyChanges = () => {
    if (selectedElements.length === 0) return;

    selectedElements.forEach((element) => {
      const updatedElement = {
        ...element,
        style: {
          ...element.style,
          strokeColor: formValues.strokeColor,
          strokeWidth: Number(formValues.strokeWidth),
          fillColor: formValues.fillColor,
          opacity: Number(formValues.opacity),
        },
        metadata: {
          ...element.metadata,
          name: formValues.name,
          layer: formValues.layer,
          locked: formValues.locked,
          visible: formValues.visible,
          zIndex: Number(formValues.zIndex),
        },
      };

      onUpdate(element._id, updatedElement);
    });
  };

  // Handle delete element
  const handleDelete = () => {
    if (selectedElements.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${
          selectedElements.length > 1 ? "these elements" : "this element"
        }?`
      )
    ) {
      selectedElements.forEach((element) => {
        onDelete(element._id);
      });
    }
  };

  // No elements selected
  if (selectedElements.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        <p>No elements selected</p>
        <p className="text-sm mt-2">Select an element to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto">
      {/* General Properties */}
      <div className="mb-4 bg-white rounded-md shadow-sm">
        <div
          className="px-4 py-3 cursor-pointer flex justify-between items-center border-b"
          onClick={() => toggleSection("general")}
        >
          <h3 className="font-medium text-gray-700">General</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transform transition-transform ${
              expanded.general ? "rotate-180" : ""
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
        </div>

        {expanded.general && (
          <div className="p-4">
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formValues.name}
                onChange={handleInputChange}
                disabled={selectedElements.length > 1}
              />
            </div>

            <div className="mb-2">
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Type
              </label>
              <input
                type="text"
                id="type"
                name="type"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                value={
                  formValues.type.charAt(0).toUpperCase() +
                  formValues.type.slice(1)
                }
                disabled
              />
            </div>
          </div>
        )}
      </div>

      {/* Style Properties */}
      <div className="mb-4 bg-white rounded-md shadow-sm">
        <div
          className="px-4 py-3 cursor-pointer flex justify-between items-center border-b"
          onClick={() => toggleSection("style")}
        >
          <h3 className="font-medium text-gray-700">Style</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transform transition-transform ${
              expanded.style ? "rotate-180" : ""
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
        </div>

        {expanded.style && (
          <div className="p-4">
            {/* Stroke Color */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stroke Color
              </label>
              <div className="flex items-center">
                <div
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  style={{ backgroundColor: formValues.strokeColor }}
                  onClick={() =>
                    setColorPickerOpen({
                      ...colorPickerOpen,
                      stroke: !colorPickerOpen.stroke,
                    })
                  }
                ></div>
                <input
                  type="text"
                  name="strokeColor"
                  className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formValues.strokeColor}
                  onChange={handleInputChange}
                />
              </div>
              {colorPickerOpen.stroke && (
                <div className="absolute z-10 mt-1">
                  <div
                    className="fixed inset-0"
                    onClick={() =>
                      setColorPickerOpen({ ...colorPickerOpen, stroke: false })
                    }
                  ></div>
                  <SketchPicker
                    color={formValues.strokeColor}
                    onChange={(color) =>
                      handleColorChange("strokeColor", color)
                    }
                  />
                </div>
              )}
            </div>

            {/* Stroke Width */}
            <div className="mb-4">
              <label
                htmlFor="strokeWidth"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Stroke Width: {formValues.strokeWidth}px
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="strokeWidth"
                  name="strokeWidth"
                  min="0"
                  max="20"
                  step="0.5"
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  value={formValues.strokeWidth}
                  onChange={handleInputChange}
                />
                <input
                  type="number"
                  name="strokeWidth"
                  className="ml-2 w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formValues.strokeWidth}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                  step="0.5"
                />
              </div>
            </div>

            {/* Fill Color */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fill Color
              </label>
              <div className="flex items-center">
                <div
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  style={{ backgroundColor: formValues.fillColor }}
                  onClick={() =>
                    setColorPickerOpen({
                      ...colorPickerOpen,
                      fill: !colorPickerOpen.fill,
                    })
                  }
                ></div>
                <input
                  type="text"
                  name="fillColor"
                  className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formValues.fillColor}
                  onChange={handleInputChange}
                />
              </div>
              {colorPickerOpen.fill && (
                <div className="absolute z-10 mt-1">
                  <div
                    className="fixed inset-0"
                    onClick={() =>
                      setColorPickerOpen({ ...colorPickerOpen, fill: false })
                    }
                  ></div>
                  <SketchPicker
                    color={formValues.fillColor}
                    onChange={(color) => handleColorChange("fillColor", color)}
                  />
                </div>
              )}
            </div>

            {/* Opacity */}
            <div className="mb-2">
              <label
                htmlFor="opacity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Opacity: {Math.round(formValues.opacity * 100)}%
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="opacity"
                  name="opacity"
                  min="0"
                  max="1"
                  step="0.01"
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  value={formValues.opacity}
                  onChange={handleInputChange}
                />
                <input
                  type="number"
                  name="opacity"
                  className="ml-2 w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formValues.opacity}
                  onChange={handleInputChange}
                  min="0"
                  max="1"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metadata Properties */}
      <div className="mb-4 bg-white rounded-md shadow-sm">
        <div
          className="px-4 py-3 cursor-pointer flex justify-between items-center border-b"
          onClick={() => toggleSection("metadata")}
        >
          <h3 className="font-medium text-gray-700">Metadata</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transform transition-transform ${
              expanded.metadata ? "rotate-180" : ""
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
        </div>

        {expanded.metadata && (
          <div className="p-4">
            <div className="mb-4">
              <label
                htmlFor="layer"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Layer
              </label>
              <select
                id="layer"
                name="layer"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formValues.layer}
                onChange={handleInputChange}
              >
                <option value="default">Default</option>
                <option value="walls">Walls</option>
                <option value="doors">Doors</option>
                <option value="windows">Windows</option>
                <option value="furniture">Furniture</option>
                <option value="text">Text</option>
                <option value="dimensions">Dimensions</option>
              </select>
            </div>

            <div className="mb-4">
              <label
                htmlFor="visible"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Visible
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="visible"
                  name="visible"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formValues.visible}
                  onChange={handleInputChange}
                />
                <label
                  htmlFor="visible"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Element is visible
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="locked"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Locked
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="locked"
                  name="locked"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formValues.locked}
                  onChange={handleInputChange}
                />
                <label
                  htmlFor="locked"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Element is locked (prevent editing)
                </label>
              </div>
            </div>

            <div className="mb-2">
              <label
                htmlFor="zIndex"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Z-Index
              </label>
              <input
                type="number"
                id="zIndex"
                name="zIndex"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formValues.zIndex}
                onChange={handleInputChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                Higher values appear on top
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={applyChanges}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Apply Changes
        </button>

        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default Properties;
