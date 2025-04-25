// backend/models/Drawing.js
const mongoose = require("mongoose");

const DrawingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  elements: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Element",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  viewBox: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 1000 },
    height: { type: Number, default: 800 },
  },
  scale: {
    type: Number,
    default: 1,
  },
  gridSettings: {
    enabled: { type: Boolean, default: true },
    size: { type: Number, default: 50 },
    snap: { type: Boolean, default: true },
  },
});

module.exports = mongoose.model("Drawing", DrawingSchema);
