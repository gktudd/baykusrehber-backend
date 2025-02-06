const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// 📌 **Google Places API'den fotoğrafları al**
const getPlacePhotos = async (req, res) => {
  const { placeId } = req.query;
  if (!placeId) return res.status(400).json({ error: "❌ Place ID gereklidir." });

  try {
    console.log("📸 API İsteği:", `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_API_KEY}`);
    
    const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
      params: {
        place_id: placeId,
        fields: "photos",
        key: GOOGLE_API_KEY,
      },
    });

    console.log("Google API Yanıtı:", JSON.stringify(response.data, null, 2));

    if (response.data.status !== "OK") {
      return res.status(404).json({ error: "❌ Fotoğraflar alınamadı veya API sınırına ulaşıldı." });
    }

    const photos = response.data.result?.photos || [];
    if (photos.length === 0) {
      return res.status(404).json({ error: "⚠️ Bu mekan için fotoğraf bulunamadı." });
    }

    const photoUrls = photos.map(photo => ({
      url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
    }));

    res.json(photoUrls);
  } catch (error) {
    console.error("🔥 Fotoğrafları çekerken hata oluştu:", error);
    res.status(500).json({ error: "❌ Fotoğraflar alınamadı." });
  }
};

// 📌 **Google Places API'den YORUMLARI al (Sadece ilk 5 yorum)**
const getPlaceReviews = async (req, res) => {
  const { placeId } = req.query;
  if (!placeId) return res.status(400).json({ error: "❌ Place ID gereklidir." });

  try {
    console.log("📝 API İsteği:", `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&language=tr&key=${GOOGLE_API_KEY}`);
    
    const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
      params: {
        place_id: placeId,
        fields: "reviews,rating,user_ratings_total",
        language: "tr",
        key: GOOGLE_API_KEY,
      },
    });

    console.log("Google API Yanıtı:", JSON.stringify(response.data, null, 2));

    if (response.data.status !== "OK") {
      return res.status(404).json({ error: "❌ Restoran bilgileri alınamadı veya API sınırına ulaşıldı." });
    }

    const result = response.data.result;
    if (!result) {
      return res.status(404).json({ error: "⚠️ Restoran bilgileri bulunamadı." });
    }

    const rating = result.rating || 0;
    const ratingCount = result.user_ratings_total || 0;
    const reviews = result.reviews || [];

    // 📌 **Sadece İlk 5 Yorum Gösterilecek**
    const formattedReviews = reviews.slice(0, 5).map(review => ({
      author: review.author_name,
      rating: review.rating,
      text: review.text,
      time: new Date(review.time * 1000).toLocaleString("tr-TR"),
    }));

    console.log("✅ Yorumlar başarıyla çekildi! Yorum Sayısı:", formattedReviews.length);

    res.json({
      rating,
      ratingCount,
      reviews: formattedReviews,
    });

  } catch (error) {
    console.error("🔥 Yorumları çekerken hata oluştu:", error);
    res.status(500).json({ error: "❌ Yorumlar alınamadı." });
  }
};

// 📌 **Sunucuyu başlat**
app.get("/api/google-photos", getPlacePhotos);
app.get("/api/google-reviews", getPlaceReviews);

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor...`);
});

module.exports = { getPlacePhotos, getPlaceReviews };