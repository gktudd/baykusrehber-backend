const express = require("express");
const {
  getPlacePhotos,
  getPlaceReviews,
  getPlaceDistances,
} = require("../services/googleService");

const router = express.Router();

// 📸 Google Places API'den fotoğrafları al
router.get("/photos", getPlacePhotos); // ✅ Query param: ?placeId=...

// 📝 Google Places API'den yorumları al
router.get("/reviews", getPlaceReviews); // ✅ Query param: ?placeId=...

// 📍 Google Distance Matrix API ile gerçek mesafe ve süreler
router.get("/distances", getPlaceDistances); // ✅ Query param: ?origin=...&destinations=...

module.exports = router;