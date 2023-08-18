const mongoose = require("mongoose");
const express = require("express");
const { User, Course, Admin } = require("../db/index");
const jwt = require("jsonwebtoken");
const { SECRET } = require("../middleware/auth");
const { authenticatingJwt } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username, password });

  if (admin) {
    req.sendStatus(403).json({ message: "Admin already exists" });
  } else {
    const obj = { username, password };
    const newAdmin = new Admin(obj);
    newAdmin.save();
    const token = jwt.sign({ username, role: "Admin" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Admin created successfully", token });
  }
});

router.get("/me", authenticatingJwt, async (req, res) => {
  const admin = await Admin.findOne({ username: req.user.username });
  if (!admin) {
    res.status(403).json({ message: "Admin doesnot exists" });
    return;
  } else {
    res.json({
      username: admin.username,
    });
  }
});

router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username, password });
  if (admin) {
    const token = jwt.sign({ username, role: "Admin" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Admin loggedin Successfully", token });
  } else {
    res.status(403).json({ message: "Username or Password is incorrect" });
  }
});

// Posting new course
router.post("/courses", authenticatingJwt, async (req, res) => {
  const course = new Course(req.body);
  await course.save();
  res.json({ message: "Course created successfully", courseId: course.id });
});

// Updating the course
router.put("/courses/:courseId", authenticatingJwt, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, {
    new: true,
  });
  if (course) {
    res.json({ message: "Course Updated successfully" });
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

// Getting all the courses
router.get("/courses", authenticatingJwt, async (req, res) => {
  const courses = await Course.find({});
  res.json({ courses });
});

// Getting the Course by Course Id
router.get("/course/:courseId", authenticatingJwt, async (req, res) => {
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId);
  res.json({ course });
});

// Deleting course By Id
router.delete("/course/:courseId", authenticatingJwt, async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId) res.json({ message: "Id Required" });
    const deletedDoc = await Course.findByIdAndDelete(courseId);
    res.json({ data: deletedDoc });
  } catch (err) {
    console.log(err)
    res.status(500).json({message: "Internal Server Error"})
  }
});

module.exports = router;
