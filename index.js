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
mongoose.connect('mongodb+srv://vishuvishalbanotra:******@cluster0.rp9vsvt.mongodb.net/Coursill', {useNewUrlParser: true, useUnifiedTopology: true, dbName: "Coursill"})

app.listen(3000, () => console.log("App is running on port 3000"))
