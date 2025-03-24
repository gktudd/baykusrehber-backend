// routes/googleRoutes.js
const express = require("express");
const {
  getPlacePhotos,
  getPlaceReviews,
  getPlaceDistances,
} = require("../services/googleService");

const router = express.Router();

// ✅ Query parametre ile çalışsın
router.get("/google-photos", getPlacePhotos);   // <-- Bu doğru
router.get("/google-reviews", getPlaceReviews);
router.get("/distances", getPlaceDistances);

module.exports = router;