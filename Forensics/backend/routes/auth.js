const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function generateRoleId(role) {
  const rand = Math.floor(10000 + Math.random() * 90000);
  if (role === "Administrator") return `ADM-${rand}`;
  if (role === "Investigator") return `INV-${rand}`;
  return `ANL-${rand}`;
}

router.post("/signup", async (req, res) => {
  const { name, email, password, role, department, specialization } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const roleId = generateRoleId(role);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    role,
    department,
    specialization,
    adminId: role === "Administrator" ? roleId : undefined,
    investigatorId: role === "Investigator" ? roleId : undefined,
    analystId: role === "Analyst" ? roleId : undefined,
  });

  await user.save();
  res.json({
  message: "User created",
  roleId: roleId,
  role: role,
});
});

router.post("/login", async (req, res) => {
  const { email, password, roleId } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid password" });

  if (![user.adminId, user.investigatorId, user.analystId].includes(roleId)) {
    return res.status(400).json({ error: "Invalid Role ID" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

module.exports = router;
