
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  adminId: String,
  investigatorId: String,
  analystId: String,
  department: String,
  specialization: String,
  googleId: String,
});




module.exports = mongoose.model("User", userSchema);
