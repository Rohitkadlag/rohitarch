// models/Project.js
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  owner: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  collaborators: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],

  drawings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drawing",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    projectType: String,
    client: String,
    location: String,
  },
});

module.exports = mongoose.model("Project", ProjectSchema);
