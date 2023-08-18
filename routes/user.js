const express = require("express");
const jwt = require("jsonwebtoken");
const { authenticatingJwt, SECRET } = require("../middleware/auth");
const { User, Course, Admin } = require("../db");
const router = express.Router();

router.get("/me", authenticatingJwt, async (req, res) => {
  try {
    const username = req.user.username;
    const user = await User.findOne({ username });
    if(!user){
      res.status(403).json({message: "User does not exist."})
    }else{
      res.json({username: user.username})
    }
  } catch (err) {
    res.status(500).json({message: "Internal server error."})
  }
});

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (user) {
    res.status(403).json({ message: "User already exists" });
  } else {
    const newUser = new User({ username, password });
    await newUser.save();
    const token = jwt.sign({ username, role: "User" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "User created successfully", token });
  }
});

router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (user) {
    const token = jwt.sign({ username, role: "User" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "User successfully Logged in.", token });
  } else {
    res.status(403).json({ message: "Incorrect Username or Password" });
  }
});

router.get("/courses", authenticatingJwt, async (req, res) => {
  const courses = await Course.find({ published: true });
  res.json({ courses });
});

router.post("/course/:courseId", authenticatingJwt, async (req, res) => {
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId);

  if (course) {
    const user = await User.findOne({ username: req.user.username });
    if (user) {
      user.purchasedCourses.push(course);
      await user.save();
      res.json({ message: "Course Purchased successfully" });
    } else {
      res.status(403).json({ message: "User not found" });
    }
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

router.get("/purchasedcourses", authenticatingJwt, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).populate(
    "purchasedCourses"
  );
  if (user) {
    res.json({ purchasedCourses: user.purchasedCourses || [] });
  } else {
    res.status(403).json({ message: "User not found" });
  }
});

module.exports = router;
