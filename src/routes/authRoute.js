const express = require("express");

const { login, register, logout } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/logout", authMiddleware, logout);

module.exports = router;
