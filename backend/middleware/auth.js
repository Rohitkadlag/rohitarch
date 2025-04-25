const mongoose = require("mongoose");

module.exports = async function (req, res, next) {
  // TEMPORARY: Skip authentication for development
  console.warn("Authentication middleware bypassed for development");

  // Create a valid MongoDB ObjectId for development
  const devUserId = new mongoose.Types.ObjectId();

  // Mock a user for development
  req.user = {
    id: devUserId,
    name: "Development User",
  };

  next();
};
