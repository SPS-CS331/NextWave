require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
require("./config/passport");

const authRoutes = require("./routes/auth");
const cors = require("cors");
// app.use(cors());
const app = express();
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

mongoose.connect(process.env.MONGO_URI);

app.use("/api/auth", authRoutes);

app.listen(5000, () => console.log("Backend running on port 5000"));
