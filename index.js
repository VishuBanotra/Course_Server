const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const adminRouter = require("./routes/admin")
const userRouter = require("./routes/user")

const app = express();

app.use(express.json());
app.use(cors());

app.use("/admin", adminRouter)
app.use("/user", userRouter)

// connecting to mongoDb
mongoose.connect()

app.listen(3000, () => console.log("App is running on port 3000"))
