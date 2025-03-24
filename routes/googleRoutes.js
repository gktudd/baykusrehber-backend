const express = require("express");
const { getPlacePhotos, getPlaceReviews } = require("../services/googleService");

const router = express.Router();

// 📌 Google Places API'den fotoğrafları al
router.get("/photos/:placeId", getPlacePhotos);

// 📌 Google Places API'den yorumları al
router.get("/reviews/:placeId", getPlaceReviews);

//Google Matrix Api ile tam uzaklık, yürüme ve araç süresi hesaplayıcı
router.get("/distances", getPlaceDistances); // 📌 Yeni rota eklendi


module.exports = router;