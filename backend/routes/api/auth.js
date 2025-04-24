// const express = require("express");
// const router = express.Router();
// const auth = require("../../middleware/auth");
// const User = require("../../models/User");
// const { check, validationResult } = require("express-validator");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// require("dotenv").config();

// // @route   POST api/auth/register
// // @desc    Register user
// // @access  Public
// router.post(
//   "/register",
//   [
//     check("name", "Name is required").not().isEmpty(),
//     check("email", "Please include a valid email").isEmail(),
//     check(
//       "password",
//       "Please enter a password with 6 or more characters"
//     ).isLength({ min: 6 }),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { name, email, password } = req.body;

//     try {
//       // Check if user exists
//       let user = await User.findOne({ email });

//       if (user) {
//         return res
//           .status(400)
//           .json({ errors: [{ msg: "User already exists" }] });
//       }

//       user = new User({
//         name,
//         email,
//         password,
//       });

//       await user.save();

//       // Create token
//       const token = user.getSignedJwtToken();

//       res.json({ token });
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send("Server error");
//     }
//   }
// );

// // @route   POST api/auth/login
// // @desc    Authenticate user & get token
// // @access  Public
// router.post(
//   "/login",
//   [
//     check("email", "Please include a valid email").isEmail(),
//     check("password", "Password is required").exists(),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { email, password } = req.body;

//     try {
//       // Check for user
//       let user = await User.findOne({ email }).select("+password");

//       if (!user) {
//         return res
//           .status(400)
//           .json({ errors: [{ msg: "Invalid Credentials" }] });
//       }

//       const isMatch = await user.matchPassword(password);

//       if (!isMatch) {
//         return res
//           .status(400)
//           .json({ errors: [{ msg: "Invalid Credentials" }] });
//       }

//       // Create token
//       const token = user.getSignedJwtToken();

//       res.json({ token });
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send("Server error");
//     }
//   }
// );

// // @route   GET api/auth/user
// // @desc    Get user data
// // @access  Private
// router.get("/user", auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     res.json(user);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });

// module.exports = router;

// routes/api/auth.js
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getUser,
} = require("../../controllers/authController");
const auth = require("../../middleware/auth");

// @route   POST api/auth/register
// @desc    Register user & get token
// @access  Public
router.post("/register", register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", login);

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get("/user", auth, getUser);

module.exports = router;
