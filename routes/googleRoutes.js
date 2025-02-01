const express = require("express");
const { getPlacePhotos, getPlaceReviews } = require("../services/googleService");

const router = express.Router();

// 📌 Google Places API'den fotoğrafları al
router.get("/photos/:placeId", getPlacePhotos);

// 📌 Google Places API'den yorumları al
router.get("/reviews/:placeId", getPlaceReviews);

module.exports = router;