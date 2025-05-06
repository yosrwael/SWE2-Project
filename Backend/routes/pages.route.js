// routes/pages.route.js
const express = require("express");
const {
  homePage,
  authPage,
  discountPage,
} = require("../controllers/pages.conroller");

const router = express.Router();

router.get("/home", homePage);
router.get("/auth",authPage);
router.get("/discount", discountPage);

module.exports = router;