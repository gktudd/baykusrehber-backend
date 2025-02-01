const axios = require("axios");
require("dotenv").config();

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// 📌 Google Places API'den fotoğrafları al
const getPlacePhotos = async (req, res) => {
  const { placeId } = req.params;
  if (!placeId) return res.status(400).json({ error: "Place ID gereklidir." });

  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
      params: {
        place_id: placeId,
        fields: "photos",
        key: GOOGLE_API_KEY,
      },
    });

    const photos = response.data.result?.photos || [];
    const photoUrls = photos.map(photo => ({
      url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
    }));

    res.json(photoUrls);
  } catch (error) {
    console.error("🔥 Fotoğrafları çekerken hata oluştu:", error);
    res.status(500).json({ error: "Fotoğraflar alınamadı." });
  }
};

// 📌 Google Places API'den yorumları al
const getPlaceReviews = async (req, res) => {
  const { placeId } = req.params;
  if (!placeId) return res.status(400).json({ error: "Place ID gereklidir." });

  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
      params: {
        place_id: placeId,
        fields: "reviews",
        language: "tr",
        key: GOOGLE_API_KEY,
      },
    });

    const reviews = response.data.result?.reviews || [];
    const formattedReviews = reviews.map(review => ({
      author: review.author_name,
      rating: review.rating,
      text: review.text,
      time: new Date(review.time * 1000).toLocaleString("tr-TR"),
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error("🔥 Yorumları çekerken hata oluştu:", error);
    res.status(500).json({ error: "Yorumlar alınamadı." });
  }
};

module.exports = { getPlacePhotos, getPlaceReviews };