// models/Element.js
const mongoose = require("mongoose");

const ElementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "wall",
      "door",
      "window",
      "furniture",
      "room",
      "text",
      "dimension",
      "path",
    ],
    required: true,
  },
  drawing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Drawing",
    required: true,
  },
  geometry: {
    points: [{ x: Number, y: Number }],
    shape: String,
    width: Number,
    height: Number,
    rotation: Number,
    content: String,
    fontSize: Number,
    fontFamily: String,
  },
  style: {
    strokeColor: { type: String, default: "#000000" },
    strokeWidth: { type: Number, default: 1 },
    fillColor: { type: String, default: "transparent" },
    opacity: { type: Number, default: 1 },
    lineDash: [Number],
  },
  metadata: {
    name: String,
    layer: { type: String, default: "default" },
    locked: { type: Boolean, default: false },
    visible: { type: Boolean, default: true },
    zIndex: { type: Number, default: 0 },
    custom: mongoose.Schema.Types.Mixed,
  },
});

module.exports = mongoose.model("Element", ElementSchema);
