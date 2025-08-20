const axios = require("axios");
require("dotenv").config();

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// 📸 Fotoğrafları al
const getPlacePhotos = async (req, res) => {
  const { placeId } = req.query;
  if (!placeId) {
    return res.status(400).json({ error: "❌ Place ID gereklidir." });
  }

  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
      params: {
        place_id: placeId,
        fields: "photos",
        key: GOOGLE_API_KEY,
      },
    });

    if (response.data.status !== "OK") {
      return res.status(404).json({ error: "❌ Fotoğraflar alınamadı veya API sınırına ulaşıldı." });
    }

    const photos = response.data.result?.photos || [];
    if (photos.length === 0) {
      return res.status(404).json({ error: "⚠️ Bu mekan için fotoğraf bulunamadı." });
    }

    // ✅ FLUTTER İÇİN DÜZGÜN ÇIKTI: Sadece dizi halinde URL'ler döndürülüyor (en fazla 7)
    const photoUrls = photos.slice(0, 7).map(
      (photo) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
    );

    return res.json(photoUrls); // ✅ Sadece [ "url1", "url2", ... ] formatında
  } catch (error) {
    console.error("🔥 Fotoğrafları çekerken hata oluştu:", error.message);
    return res.status(500).json({ error: "❌ Fotoğraflar alınamadı." });
  }
};

// 📝 Yorumları ve puanları al
const getPlaceReviews = async (req, res) => {
  const { placeId } = req.query;
  if (!placeId) {
    return res.status(400).json({ error: "❌ Place ID gereklidir." });
  }

  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
      params: {
        place_id: placeId,
        fields: "reviews,rating,user_ratings_total",
        language: "tr",
        key: GOOGLE_API_KEY,
      },
    });

    if (response.data.status !== "OK") {
      return res.status(404).json({ error: "❌ Restoran bilgileri alınamadı veya API sınırına ulaşıldı." });
    }

    const result = response.data.result;
    if (!result) {
      return res.status(404).json({ error: "⚠️ Restoran bilgileri bulunamadı." });
    }

    const reviews = (result.reviews || []).slice(0, 5); // 🔒 Sadece ilk 5 yorum
    const rating = result.rating || 0;
    const ratingCount = result.user_ratings_total || 0;

    const formattedReviews = reviews.map((review) => ({
      author: review.author_name,
      rating: review.rating,
      text: review.text,
      time: new Date(review.time * 1000).toLocaleString("tr-TR"),
      timestamp: review.time,
    }));

    return res.json({
      rating,
      ratingCount,
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error("🔥 Yorumları çekerken hata oluştu:", error.message);
    return res.status(500).json({ error: "❌ Yorumlar alınamadı." });
  }
};

// 📍 Mesafeleri ve süreleri al
const getPlaceDistances = async (req, res) => {
  const { origin, destinations } = req.query;

  if (!origin || !destinations) {
    return res.status(400).json({ error: "❌ origin ve destinations zorunludur." });
  }

  try {
    // 🚗 Araçla mesafe
    const drivingResponse = await axios.get("https://maps.googleapis.com/maps/api/distancematrix/json", {
      params: {
        origins: origin,
        destinations,
        key: GOOGLE_API_KEY,
        language: "tr",
        units: "metric",
        mode: "driving",
      },
    });

    // 🚶‍♂️ Yürüyerek mesafe
    const walkingResponse = await axios.get("https://maps.googleapis.com/maps/api/distancematrix/json", {
      params: {
        origins: origin,
        destinations,
        key: GOOGLE_API_KEY,
        language: "tr",
        units: "metric",
        mode: "walking",
      },
    });

    const drivingInfo = drivingResponse.data.rows[0]?.elements || [];
    const walkingInfo = walkingResponse.data.rows[0]?.elements || [];

    const results = drivingInfo.map((driveItem, index) => ({
      distance: driveItem.distance?.text || "Bilinmiyor",
      durationByCar: driveItem.duration?.text || "Bilinmiyor",
      durationByWalk: walkingInfo[index]?.duration?.text || "Bilinmiyor",
    }));

    return res.json(results);
  } catch (error) {
    console.error("🔥 Mesafe API hatası:", error.message);
    return res.status(500).json({ error: "❌ Mesafe verileri alınamadı." });
  }
};

// 📤 Dışa Aktarım
module.exports = {
  getPlacePhotos,
  getPlaceReviews,
  getPlaceDistances,
};