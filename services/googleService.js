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
        fields: "reviews,rating,user_ratings_total",
        language: "tr",
        key: GOOGLE_API_KEY,
      },
    });

    const result = response.data.result;
    
    if (!result) {
      return res.status(404).json({ error: "Restoran bilgileri bulunamadı." });
    }

    const rating = result.rating || 0; // 📌 Restoranın genel puanı
    const ratingCount = result.user_ratings_total || 0; // 📌 Kaç kişi puan vermiş
    const reviews = result.reviews || [];

    const formattedReviews = reviews.map(review => ({
      author: review.author_name,
      rating: review.rating,
      text: review.text,
      time: new Date(review.time * 1000).toLocaleString("tr-TR"),
    }));

    res.json({
      rating,
      ratingCount,
      reviews: formattedReviews.length > 0 ? formattedReviews : "Bu restoran için yorum bulunmuyor."
    });

  } catch (error) {
    console.error("🔥 Yorumları çekerken hata oluştu:", error);
    res.status(500).json({ error: "Yorumlar alınamadı." });
  }
};

module.exports = { getPlacePhotos, getPlaceReviews };