// backend/routes/api/projects.js
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Project = require("../../models/Project");
const User = require("../../models/User");

// @route   GET api/projects
// @desc    Get all projects for current user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { collaborators: req.user.id }],
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/projects
// @desc    Create a new project
// @access  Private
router.post(
  "/",
  [auth, [check("title", "Title is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, metadata } = req.body;

      const newProject = new Project({
        title,
        description,
        owner: req.user.id,
        metadata,
      });

      const project = await newProject.save();

      // Add project to user's projects array
      await User.findByIdAndUpdate(req.user.id, {
        $push: { projects: project._id },
      });

      res.json(project);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/projects/:id
// @desc    Get a project by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Check if user is owner or collaborator
    if (
      project.owner.toString() !== req.user.id &&
      !project.collaborators.includes(req.user.id)
    ) {
      return res
        .status(401)
        .json({ msg: "Not authorized to access this project" });
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Project not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/projects/:id
// @desc    Update a project
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "Not authorized to update this project" });
    }

    const { title, description, metadata } = req.body;

    // Update fields if provided
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (metadata) project.metadata = { ...project.metadata, ...metadata };

    project.updatedAt = Date.now();

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Project not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "Not authorized to delete this project" });
    }

    await project.deleteOne();

    // Remove project from user's projects array
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { projects: req.params.id },
    });

    res.json({ msg: "Project removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Project not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   POST api/projects/:id/collaborators
// @desc    Add a collaborator to project
// @access  Private
router.post(
  "/:id/collaborators",
  [auth, [check("email", "Email is required").isEmail()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ msg: "Project not found" });
      }

      // Check if user is owner
      if (project.owner.toString() !== req.user.id) {
        return res
          .status(401)
          .json({ msg: "Not authorized to add collaborators" });
      }

      // Find user by email
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Check if already a collaborator
      if (project.collaborators.includes(user._id)) {
        return res.status(400).json({ msg: "User is already a collaborator" });
      }

      // Check if user is the owner
      if (project.owner.toString() === user._id.toString()) {
        return res
          .status(400)
          .json({ msg: "Owner cannot be added as a collaborator" });
      }

      // Add to collaborators array
      project.collaborators.push(user._id);
      await project.save();

      // Add project to user's projects
      await User.findByIdAndUpdate(user._id, {
        $push: { projects: project._id },
      });

      res.json(project);
    } catch (err) {
      console.error(err.message);
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Project not found" });
      }
      res.status(500).send("Server Error");
    }
  }
);

// @route   DELETE api/projects/:projectId/collaborators/:userId
// @desc    Remove a collaborator from project
// @access  Private
router.delete("/:projectId/collaborators/:userId", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "Not authorized to remove collaborators" });
    }

    // Remove from collaborators array
    project.collaborators = project.collaborators.filter(
      (id) => id.toString() !== req.params.userId
    );

    await project.save();

    // Remove project from user's projects
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { projects: project._id },
    });

    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Project or user not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
