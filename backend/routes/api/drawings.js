// backend/routes/api/drawings.js
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Drawing = require("../../models/Drawing");
const Project = require("../../models/Project");
const Element = require("../../models/Element");
const mongoose = require("mongoose");

// @route   GET api/drawings/:id
// @desc    Get a drawing by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const drawing = await Drawing.findById(req.params.id);

    if (!drawing) {
      return res.status(404).json({ msg: "Drawing not found" });
    }

    // Get the project to check permissions
    const project = await Project.findById(drawing.project);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Check if user has access to the project
    if (
      project.owner.toString() !== req.user.id &&
      !project.collaborators.includes(req.user.id)
    ) {
      return res
        .status(401)
        .json({ msg: "Not authorized to access this drawing" });
    }

    res.json(drawing);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Drawing not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   GET api/projects/:projectId/drawings
// @desc    Get all drawings for a project
// @access  Private
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Check if user has access to the project
    if (
      project.owner.toString() !== req.user.id &&
      !project.collaborators.includes(req.user.id)
    ) {
      return res
        .status(401)
        .json({ msg: "Not authorized to access this project" });
    }

    const drawings = await Drawing.find({ project: req.params.projectId }).sort(
      { createdAt: -1 }
    );

    res.json(drawings);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Project not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   POST api/projects/:projectId/drawings
// @desc    Create a new drawing in a project
// @access  Private
router.post(
  "/project/:projectId",
  [auth, [check("title", "Title is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const project = await Project.findById(req.params.projectId);

      if (!project) {
        return res.status(404).json({ msg: "Project not found" });
      }

      // Check if user has access to the project
      if (
        project.owner.toString() !== req.user.id &&
        !project.collaborators.includes(req.user.id)
      ) {
        return res
          .status(401)
          .json({ msg: "Not authorized to create drawings in this project" });
      }

      const { title, viewBox, scale, gridSettings } = req.body;

      const newDrawing = new Drawing({
        title,
        project: req.params.projectId,
        createdBy: req.user.id,
        viewBox: viewBox || {
          x: 0,
          y: 0,
          width: 1000,
          height: 800,
        },
        scale: scale || 1,
        gridSettings: gridSettings || {
          enabled: true,
          size: 50,
          snap: true,
        },
      });

      const drawing = await newDrawing.save();

      // Add drawing to project's drawings array
      project.drawings.push(drawing._id);
      await project.save();

      res.json(drawing);
    } catch (err) {
      console.error(err.message);
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Project not found" });
      }
      res.status(500).send("Server Error");
    }
  }
);

// @route   PUT api/drawings/:id
// @desc    Update a drawing
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    let drawing = await Drawing.findById(req.params.id);

    if (!drawing) {
      return res.status(404).json({ msg: "Drawing not found" });
    }

    // Get the project to check permissions
    const project = await Project.findById(drawing.project);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Check if user has access to the project
    if (
      project.owner.toString() !== req.user.id &&
      !project.collaborators.includes(req.user.id)
    ) {
      return res
        .status(401)
        .json({ msg: "Not authorized to update this drawing" });
    }

    const { title, viewBox, scale, gridSettings } = req.body;

    // Update fields if provided
    if (title) drawing.title = title;
    if (viewBox) drawing.viewBox = viewBox;
    if (scale) drawing.scale = scale;
    if (gridSettings) drawing.gridSettings = gridSettings;

    drawing.updatedAt = Date.now();

    await drawing.save();
    res.json(drawing);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Drawing not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/drawings/:id
// @desc    Delete a drawing
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const drawing = await Drawing.findById(req.params.id);

    if (!drawing) {
      return res.status(404).json({ msg: "Drawing not found" });
    }

    // Get the project to check permissions
    const project = await Project.findById(drawing.project);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Check if user has access to the project
    if (project.owner.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "Not authorized to delete this drawing" });
    }

    // Delete all elements in the drawing
    await Element.deleteMany({ drawing: req.params.id });

    // Delete the drawing
    await drawing.deleteOne();

    // Remove drawing from project's drawings array
    project.drawings = project.drawings.filter(
      (id) => id.toString() !== req.params.id
    );

    await project.save();

    res.json({ msg: "Drawing removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Drawing not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   GET api/drawings/:drawingId/elements
// @desc    Get all elements for a drawing
// @access  Private
router.get("/:drawingId/elements", auth, async (req, res) => {
  try {
    const drawing = await Drawing.findById(req.params.drawingId);

    if (!drawing) {
      return res.status(404).json({ msg: "Drawing not found" });
    }

    // Get the project to check permissions
    const project = await Project.findById(drawing.project);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Check if user has access to the project
    if (
      project.owner.toString() !== req.user.id &&
      !project.collaborators.includes(req.user.id)
    ) {
      return res
        .status(401)
        .json({ msg: "Not authorized to access this drawing" });
    }

    const elements = await Element.find({ drawing: req.params.drawingId });

    res.json(elements);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Drawing not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/drawings/:drawingId/elements/batch
// @desc    Batch update elements
// @access  Private
router.put("/:drawingId/elements/batch", auth, async (req, res) => {
  try {
    const drawing = await Drawing.findById(req.params.drawingId);

    if (!drawing) {
      return res.status(404).json({ msg: "Drawing not found" });
    }

    // Get the project to check permissions
    const project = await Project.findById(drawing.project);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Check if user has access to the project
    if (
      project.owner.toString() !== req.user.id &&
      !project.collaborators.includes(req.user.id)
    ) {
      return res
        .status(401)
        .json({ msg: "Not authorized to update this drawing" });
    }

    const { elements } = req.body;

    if (!elements || !Array.isArray(elements)) {
      return res.status(400).json({ msg: "Elements array is required" });
    }

    // Start a session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete all existing elements
      await Element.deleteMany({ drawing: req.params.drawingId }).session(
        session
      );

      // Create new elements with IDs from the request or new IDs
      const createdElements = await Element.insertMany(
        elements.map((element) => ({
          ...element,
          _id: element._id || new mongoose.Types.ObjectId(),
          drawing: req.params.drawingId,
        })),
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      res.json(createdElements);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Drawing not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
