const Project = require("../models/Project");
const User = require("../models/User");

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { collaborators: req.user.id }],
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
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
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
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
      return res.status(401).json({ msg: "Not authorized" });
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Project not found" });
    }
    res.status(500).send("Server Error");
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    const { title, description, metadata } = req.body;

    // Get project
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    // Update fields
    if (title) project.title = title;
    if (description) project.description = description;
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
};
