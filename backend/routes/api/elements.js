// backend/routes/api/elements.js
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Element = require("../../models/Element");
const Drawing = require("../../models/Drawing");
const Project = require("../../models/Project");

// @route   GET api/elements/:id
// @desc    Get an element by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const element = await Element.findById(req.params.id);

    if (!element) {
      return res.status(404).json({ msg: "Element not found" });
    }

    // Get the drawing and project to check permissions
    const drawing = await Drawing.findById(element.drawing);

    if (!drawing) {
      return res.status(404).json({ msg: "Drawing not found" });
    }

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
        .json({ msg: "Not authorized to access this element" });
    }

    res.json(element);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Element not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   POST api/drawings/:drawingId/elements
// @desc    Create a new element in a drawing
// @access  Private
router.post(
  "/drawing/:drawingId",
  [auth, [check("type", "Type is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
          .json({ msg: "Not authorized to add elements to this drawing" });
      }

      const { type, geometry, style, metadata } = req.body;

      const newElement = new Element({
        type,
        drawing: req.params.drawingId,
        geometry,
        style,
        metadata,
      });

      const element = await newElement.save();

      // Add element to drawing's elements array
      drawing.elements.push(element._id);
      await drawing.save();

      res.json(element);
    } catch (err) {
      console.error(err.message);
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Drawing not found" });
      }
      res.status(500).send("Server Error");
    }
  }
);

// @route   PUT api/elements/:id
// @desc    Update an element
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    let element = await Element.findById(req.params.id);

    if (!element) {
      return res.status(404).json({ msg: "Element not found" });
    }

    // Get the drawing and project to check permissions
    const drawing = await Drawing.findById(element.drawing);

    if (!drawing) {
      return res.status(404).json({ msg: "Drawing not found" });
    }

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
        .json({ msg: "Not authorized to update this element" });
    }

    const { type, geometry, style, metadata } = req.body;

    // Create update object
    const elementFields = {};
    if (type) elementFields.type = type;
    if (geometry) elementFields.geometry = geometry;
    if (style) elementFields.style = style;
    if (metadata) elementFields.metadata = metadata;

    // Update element
    element = await Element.findByIdAndUpdate(
      req.params.id,
      { $set: elementFields },
      { new: true }
    );

    res.json(element);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Element not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/elements/:id
// @desc    Delete an element
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const element = await Element.findById(req.params.id);

    if (!element) {
      return res.status(404).json({ msg: "Element not found" });
    }

    // Get the drawing and project to check permissions
    const drawing = await Drawing.findById(element.drawing);

    if (!drawing) {
      return res.status(404).json({ msg: "Drawing not found" });
    }

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
        .json({ msg: "Not authorized to delete this element" });
    }

    // Delete the element
    await element.deleteOne();

    // Remove element from drawing's elements array
    drawing.elements = drawing.elements.filter(
      (id) => id.toString() !== req.params.id
    );

    await drawing.save();

    res.json({ msg: "Element removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Element not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
